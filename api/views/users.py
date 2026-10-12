from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import hashlib
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.models import EndUserConfig, Application
from core.auth import APIKeyAuthentication, DeveloperTokenAuthentication
from api.serializers import EndUserConfigSerializer

class EndUserConfigView(APIView):
    """
    Manages End-User Voice Agent Configuration.
    Allows end-users and developers to customize wake-word, security passphrase, and voice tier.
    Supports DeveloperTokenAuthentication, APIKeyAuthentication, and auto-tenancy provisioning.
    """
    authentication_classes = [DeveloperTokenAuthentication, APIKeyAuthentication]

    def _get_application(self, request):
        if hasattr(request, 'application') and request.application:
            return request.application

        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            app = getattr(request.user, 'applications', None)
            if app:
                first_app = app.first()
                if first_app:
                    return first_app
            # Auto-provision a default application cluster for developer if needed
            new_app, _, _ = Application.create_with_keys(
                developer=request.user,
                app_name=f"{getattr(request.user, 'name', 'Developer')} Agent",
                base_url="https://api.tats.internal",
                wake_word_policy="CUSTOM"
            )
            return new_app

        return Application.objects.first()

    @extend_schema(
        tags=['End-User Voice Configuration'],
        summary='Get End-User Agent Configuration',
        description='Fetches the personalized agent config (wake word, voice tier) for a specific end-user.',
        responses={200: EndUserConfigSerializer}
    )
    def get(self, request, client_user_id):
        application = self._get_application(request)
        if not application:
            return Response({'error': 'No active application cluster available.'}, status=status.HTTP_400_BAD_REQUEST)

        user_cfg, _ = EndUserConfig.objects.get_or_create(
            application=application,
            client_user_id=str(client_user_id),
            defaults={'wake_word': 'Hey T@S'}
        )
        serializer = EndUserConfigSerializer(user_cfg)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['End-User Voice Configuration'],
        summary='Update End-User Agent Configuration',
        description='Updates wake word, voice tier, or security passphrase for the user.',
        request=EndUserConfigSerializer,
        responses={200: EndUserConfigSerializer}
    )
    def post(self, request, client_user_id):
        application = self._get_application(request)
        if not application:
            return Response({'error': 'No active application cluster available.'}, status=status.HTTP_400_BAD_REQUEST)

        user_cfg, _ = EndUserConfig.objects.get_or_create(
            application=application,
            client_user_id=str(client_user_id),
            defaults={'wake_word': 'Hey T@S'}
        )

        wake_word = request.data.get('wake_word')
        if wake_word:
            if application.wake_word_policy == 'LOCKED' and wake_word.strip().lower() != application.app_name.lower():
                return Response(
                    {'error': f"Wake word is locked to application name '{application.app_name}' by developer policy."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user_cfg.wake_word = wake_word.strip()

        voice_tier = request.data.get('voice_tier')
        if voice_tier in ['BROWSER', 'LIBRARY', 'CLONED']:
            user_cfg.voice_tier = voice_tier

        passphrase = request.data.get('passphrase')
        if passphrase:
            user_cfg.passphrase_hash = hashlib.sha256(passphrase.strip().encode('utf-8')).hexdigest()

        user_cfg.save()
        return Response({
            'message': f"Preferences updated for user '{client_user_id}'.",
            'config': EndUserConfigSerializer(user_cfg).data
        }, status=status.HTTP_200_OK)


