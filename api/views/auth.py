from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.models import Developer, DeveloperToken
from core.auth import DeveloperTokenAuthentication
from api.serializers import (
    DeveloperRegisterSerializer,
    DeveloperLoginSerializer,
    DeveloperProfileSerializer
)

class DeveloperRegisterView(APIView):
    """
    Developer self-service registration endpoint.
    Creates a new Developer account and returns an authentication token (tas_dev_...).
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Register Developer Account',
        description='Creates a new developer account. Returns developer profile and a personal developer token (tas_dev_...).',
        request=DeveloperRegisterSerializer,
        examples=[
            OpenApiExample(
                'Registration Example',
                value={
                    'name': 'Alex Mercer',
                    'email': 'alex@example.com',
                    'password': 'StrongPassword123!'
                },
                request_only=True
            )
        ],
        responses={201: DeveloperProfileSerializer}
    )
    def post(self, request):
        serializer = DeveloperRegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email'].lower().strip()
        if Developer.objects.filter(email=email).exists():
            return Response({'error': 'A developer with this email address already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        dev = Developer(
            name=data.get('name', 'Developer'),
            email=email
        )
        dev.set_password(data['password'])
        dev.save()

        token = DeveloperToken.generate(dev)

        return Response({
            'message': 'Developer account created successfully.',
            'developer': {
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'applications_count': 0,
                'created_at': dev.created_at
            },
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class DeveloperLoginView(APIView):
    """
    Developer login endpoint.
    Authenticates email and password, returning an active developer token (tas_dev_...).
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Login to Developer Account',
        description='Authenticates a developer using email and password. Returns developer token (tas_dev_...).',
        request=DeveloperLoginSerializer,
        examples=[
            OpenApiExample(
                'Login Example',
                value={
                    'email': 'alex@example.com',
                    'password': 'StrongPassword123!'
                },
                request_only=True
            )
        ],
        responses={200: DeveloperProfileSerializer}
    )
    def post(self, request):
        serializer = DeveloperLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        email = data['email'].lower().strip()

        try:
            dev = Developer.objects.get(email=email)
        except Developer.DoesNotExist:
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not dev.check_password(data['password']):
            return Response({'error': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        token = DeveloperToken.generate(dev)

        return Response({
            'message': 'Logged in successfully.',
            'developer': {
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'applications_count': dev.applications.count(),
                'created_at': dev.created_at
            },
            'token': token.key
        }, status=status.HTTP_200_OK)


class DeveloperLogoutView(APIView):
    """
    Developer logout endpoint.
    Revokes the active developer authentication token.
    """
    authentication_classes = [DeveloperTokenAuthentication]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Logout from Developer Account',
        description='Revokes the provided developer token.',
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer Developer Token: Bearer tas_dev_...',
                required=True
            )
        ],
        responses={200: dict}
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
    Retrieves the currently authenticated developer's profile and workspace stats.
    """
    authentication_classes = [DeveloperTokenAuthentication]

    @extend_schema(
        tags=['Developer Auth & Onboarding'],
        summary='Get Developer Profile',
        description='Fetches details of the authenticated developer and active application count.',
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer Developer Token: Bearer tas_dev_...',
                required=True
            )
        ],
        responses={200: DeveloperProfileSerializer}
    )
    def get(self, request):
        dev = request.developer
        return Response({
            'developer': {
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'applications_count': dev.applications.count(),
                'created_at': dev.created_at
            }
        }, status=status.HTTP_200_OK)

