from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import hashlib
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from core.models import EndUserConfig
from core.auth import APIKeyAuthentication
from api.serializers import EndUserConfigSerializer

class EndUserConfigView(APIView):
    """
    Manages End-User Voice Agent Configuration.
    Allows end-users to customize wake-word, security passphrase, and voice tier.
    """
    authentication_classes = [APIKeyAuthentication]

    @extend_schema(
        tags=['End-User Voice Configuration'],
        summary='Get End-User Agent Configuration',
        description='Fetches the personalized agent config (wake word, voice tier) for a specific end-user.',
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer Application API Key: Bearer tas_live_...',
                required=True
            )
        ],
        responses={200: EndUserConfigSerializer}
    )
    def get(self, request, client_user_id):
        user_cfg, _ = EndUserConfig.objects.get_or_create(
            application=request.application,
            client_user_id=str(client_user_id),
            defaults={'wake_word': 'Hey T@S'}
        )
        serializer = EndUserConfigSerializer(user_cfg)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['End-User Voice Configuration'],
        summary='Update End-User Agent Configuration',
        description='Updates wake word, voice tier, or security passphrase for the user.',
        parameters=[
            OpenApiParameter(
                name='Authorization',
                type=str,
                location=OpenApiParameter.HEADER,
                description='Bearer Application API Key: Bearer tas_live_...',
                required=True
            )
        ],
        request=EndUserConfigSerializer,
        examples=[
            OpenApiExample(
                'Configure End User Example',
                value={
                    'wake_word': 'Hey Jarvis',
                    'voice_tier': 'BROWSER',
                    'passphrase': 'open sesame'
                },
                request_only=True
            )
        ],
        responses={200: EndUserConfigSerializer}
    )
    def post(self, request, client_user_id):
        user_cfg, _ = EndUserConfig.objects.get_or_create(
            application=request.application,
            client_user_id=str(client_user_id),
            defaults={'wake_word': 'Hey T@S'}
        )

        wake_word = request.data.get('wake_word')
        if wake_word:
            if request.application.wake_word_policy == 'LOCKED' and wake_word.strip().lower() != request.application.app_name.lower():
                return Response(
                    {'error': f"Wake word is locked to application name '{request.application.app_name}' by developer policy."},
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
