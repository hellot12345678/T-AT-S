import re
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.models import Developer, DeveloperToken, EmailOTPVerification, Notification
from core.auth import DeveloperTokenAuthentication, IsDeveloperAuthenticated
from api.serializers import (
    DeveloperRegisterSerializer,
    DeveloperLoginSerializer,
    DeveloperProfileSerializer,
    OTPVerifySerializer,
    ResendOTPSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)

logger = logging.getLogger(__name__)

INDIAN_PHONE_REGEX = re.compile(r'^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?([6789]\d{9})$')

def validate_indian_mobile(phone_raw: str) -> str:
    cleaned = re.sub(r'[\s\-\(\)]', '', phone_raw.strip())
    match = INDIAN_PHONE_REGEX.match(cleaned)
    if not match:
        raise ValueError("Please enter a valid 10-digit Indian mobile number (e.g., +91 9876543210 or 9876543210).")
    ten_digit = match.group(2)
    return f"+91{ten_digit}"

def validate_strong_password(password: str) -> None:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain at least one uppercase letter (A-Z).")
    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain at least one lowercase letter (a-z).")
    if not re.search(r'\d', password):
        raise ValueError("Password must contain at least one digit (0-9).")
    if not re.search(r'[@$!%*?&#^_\-+=]', password):
        raise ValueError("Password must contain at least one special character (@$!%*?&#^_-+=).")


class SystemStatusView(APIView):
    """
    Returns platform initialization status.
    Determines if the first Admin account has already been claimed.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Check System Admin Initialization Status',
        description='Returns whether the primary platform administrator has been initialized.'
    )
    def get(self, request):
        admin_exists = Developer.objects.filter(is_admin=True).exists()
        dev_count = Developer.objects.count()
        return Response({
            'is_initialized': admin_exists,
            'admin_exists': admin_exists,
            'developers_count': dev_count,
            'first_user_becomes_admin': not admin_exists,
            'message': 'Welcome to T@S. The first registered user will become Platform Administrator.' if not admin_exists else 'T@S Platform initialized.'
        }, status=status.HTTP_200_OK)


class DeveloperRegisterView(APIView):
    """
    Secure Developer Self-Service Registration.
    Validates Indian Mobile Number (+91), email, and strong password.
    Dispatches a 6-digit OTP to the provided email address for verification.
    The very first registered developer is automatically granted Platform Administrator privilege.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Register Developer Account (With Indian Mobile & Email OTP)',
        description='Initiates developer account registration. Requires Indian phone and sends 6-digit OTP to email.',
        request=DeveloperRegisterSerializer
    )
    def post(self, request):
        serializer = DeveloperRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email'].lower().strip()
        raw_phone = data.get('phone', '')
        password = data['password']

        # 1. Validate Indian Mobile
        try:
            formatted_phone = validate_indian_mobile(raw_phone)
        except ValueError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Validate Strong Password
        try:
            validate_strong_password(password)
        except ValueError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Check duplicate email or phone
        if Developer.objects.filter(email=email).exists():
            existing = Developer.objects.get(email=email)
            if not existing.is_verified:
                # Resend OTP for unverified account
                EmailOTPVerification.create_and_send(email=email, purpose='REGISTER')
                return Response({
                    'message': 'An unverified account with this email exists. A new verification OTP has been sent.',
                    'requires_otp': True,
                    'email': email,
                    'is_admin': existing.is_admin
                }, status=status.HTTP_200_OK)
            return Response({'error': 'An account with this email address already exists. Please Sign In.'}, status=status.HTTP_400_BAD_REQUEST)

        if Developer.objects.filter(phone=formatted_phone, is_verified=True).exists():
            return Response({'error': 'An account with this mobile number already exists. Please Sign In.'}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Check if this is the very first user (Designated Platform Admin)
        is_first_user = not Developer.objects.filter(is_admin=True).exists()

        dev = Developer(
            name=data.get('name', 'Developer').strip(),
            email=email,
            phone=formatted_phone,
            is_admin=is_first_user,
            is_verified=False
        )
        dev.set_password(password)
        dev.save()

        # 5. Generate and send 6-digit email OTP
        EmailOTPVerification.create_and_send(email=email, purpose='REGISTER')

        return Response({
            'message': f"Account created. A 6-digit verification code has been sent to {email}.",
            'requires_otp': True,
            'email': email,
            'is_admin': is_first_user,
            'role': 'Platform Administrator' if is_first_user else 'Developer'
        }, status=status.HTTP_201_CREATED)


class VerifyOTPView(APIView):
    """
    Verifies 6-digit Email OTP for Registration or Login.
    Upon successful OTP validation, activates user and issues auth token (tas_dev_...).
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Verify 6-Digit Email OTP',
        description='Verifies the 6-digit OTP code sent to developer email and activates the session.',
        request=OTPVerifySerializer
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        otp = serializer.validated_data['otp'].strip()
        purpose = serializer.validated_data.get('purpose', 'REGISTER')

        try:
            dev = Developer.objects.get(email=email)
        except Developer.DoesNotExist:
            return Response({'error': 'No developer account found for this email.'}, status=status.HTTP_404_NOT_FOUND)

        # Verify OTP
        is_valid = EmailOTPVerification.verify_code(email=email, raw_code=otp, purpose=purpose)
        if not is_valid:
            return Response({'error': 'Invalid or expired 6-digit verification code. Please check your email or request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark verified
        dev.is_verified = True
        dev.save()

        token = DeveloperToken.generate(dev)

        # Create welcome notification
        if purpose == 'REGISTER':
            Notification.objects.create(
                developer=dev,
                title="Welcome to T@S!",
                message=f"Your developer account is verified and ready. Provision your first application cluster to get live API keys.",
                notification_type='SUCCESS'
            )

        return Response({
            'message': 'Account verified successfully.',
            'developer': {
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'phone': dev.phone,
                'is_admin': dev.is_admin,
                'is_verified': dev.is_verified,
                'applications_count': dev.applications.count(),
                'created_at': dev.created_at
            },
            'token': token.key
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    """
    Resends 6-digit OTP to user email.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Resend Email OTP Code',
        description='Generates a fresh 6-digit OTP code and dispatches it to developer email.',
        request=ResendOTPSerializer
    )
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        purpose = serializer.validated_data.get('purpose', 'REGISTER')

        if not Developer.objects.filter(email=email).exists():
            return Response({'error': 'No developer account found for this email.'}, status=status.HTTP_404_NOT_FOUND)

        EmailOTPVerification.create_and_send(email=email, purpose=purpose)
        return Response({'message': f'A fresh verification code has been dispatched to {email}.'}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    """
    Sends a 6-digit OTP code to reset account password via email.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Request Password Reset OTP',
        description='Dispatches a 6-digit OTP to registered email for password recovery.',
        request=ForgotPasswordSerializer
    )
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        try:
            dev = Developer.objects.get(email=email)
        except Developer.DoesNotExist:
            # Mask existence for security
            return Response({'message': 'If this email is registered, a password reset code has been sent.'}, status=status.HTTP_200_OK)

        EmailOTPVerification.create_and_send(email=email, purpose='FORGOT_PASSWORD')
        return Response({'message': f'Password reset code sent to {email}.'}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """
    Resets account password using verified 6-digit OTP.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Reset Password with Verified OTP',
        description='Sets a new strong password for account after validating 6-digit OTP.',
        request=ResetPasswordSerializer
    )
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        otp = serializer.validated_data['otp'].strip()
        new_password = serializer.validated_data['new_password']

        try:
            dev = Developer.objects.get(email=email)
        except Developer.DoesNotExist:
            return Response({'error': 'No developer account found for this email.'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Validate strong password
        try:
            validate_strong_password(new_password)
        except ValueError as ve:
            return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Verify OTP
        is_valid = EmailOTPVerification.verify_code(email=email, raw_code=otp, purpose='FORGOT_PASSWORD')
        if not is_valid:
            return Response({'error': 'Invalid or expired 6-digit reset code. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Update password
        dev.set_password(new_password)
        dev.save()

        # Invalidate old tokens for security
        dev.tokens.all().delete()
        token = DeveloperToken.generate(dev)

        Notification.objects.create(
            developer=dev,
            title="Password Updated",
            message="Your account password was updated successfully. If this wasn't you, contact security immediately.",
            notification_type='WARNING'
        )

        return Response({
            'message': 'Password has been reset successfully. You are now logged in.',
            'developer': {
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'phone': dev.phone,
                'is_admin': dev.is_admin,
                'is_verified': dev.is_verified,
                'applications_count': dev.applications.count(),
                'created_at': dev.created_at
            },
            'token': token.key
        }, status=status.HTTP_200_OK)


class DeveloperLoginView(APIView):
    """
    Developer Login endpoint.
    Accepts email or registered Indian phone + password.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Login to Developer Account',
        description='Authenticates a developer using email or Indian mobile and password. Returns developer token (tas_dev_...).',
        request=DeveloperLoginSerializer
    )
    def post(self, request):
        serializer = DeveloperLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        identifier = serializer.validated_data['email'].strip()
        password = serializer.validated_data['password']

        dev = None
        # Try finding by email
        if '@' in identifier:
            dev = Developer.objects.filter(email=identifier.lower()).first()
        else:
            # Try finding by phone
            try:
                formatted_phone = validate_indian_mobile(identifier)
                dev = Developer.objects.filter(phone=formatted_phone).first()
            except ValueError:
                pass

        if not dev or not dev.check_password(password):
            return Response({'error': 'Invalid credentials. Please verify your email/phone and password.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Check if email is verified
        if not dev.is_verified:
            EmailOTPVerification.create_and_send(email=dev.email, purpose='LOGIN')
            return Response({
                'error': 'Your email address is not verified yet. A 6-digit verification code has been dispatched to your email.',
                'requires_otp': True,
                'email': dev.email
            }, status=status.HTTP_403_FORBIDDEN)

        token = DeveloperToken.generate(dev)

        return Response({
            'message': 'Logged in successfully.',
            'developer': {
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'phone': dev.phone,
                'is_admin': dev.is_admin,
                'is_verified': dev.is_verified,
                'applications_count': dev.applications.count(),
                'created_at': dev.created_at
            },
            'token': token.key
        }, status=status.HTTP_200_OK)


class DeveloperLogoutView(APIView):
    """
    Developer Logout endpoint.
    Revokes the active developer authentication token.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Logout from Developer Account',
        description='Revokes the provided developer token.'
    )
    def post(self, request):
        auth_header = request.headers.get('Authorization', '')
        parts = auth_header.split()
        if len(parts) == 2:
            DeveloperToken.objects.filter(key=parts[1].strip()).delete()
        elif hasattr(request, 'auth') and hasattr(request.auth, 'delete'):
            request.auth.delete()

        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class DeveloperMeView(APIView):
    """
    Retrieves the currently authenticated developer's profile and tenancy stats.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Get Developer Profile',
        description='Fetches details of authenticated developer, role, and application count.'
    )
    def get(self, request):
        dev = request.developer
        return Response({
            'developer': {
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'phone': dev.phone,
                'is_admin': dev.is_admin,
                'is_verified': dev.is_verified,
                'applications_count': dev.applications.count(),
                'created_at': dev.created_at
            }
        }, status=status.HTTP_200_OK)
