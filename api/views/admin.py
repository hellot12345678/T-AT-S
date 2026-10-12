from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema
from core.models import PlatformConfig
from api.serializers import PlatformConfigSerializer

class AdminConfigView(APIView):
    """
    Super Admin configuration endpoint.
    Retrieves or dynamically updates pricing tiers, unit quotas, and multipliers.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Super Admin Controls'],
        summary='Get Dynamic Platform Configuration',
        description='Fetches current platform monetization parameters: starter plan price, free monthly units, grace buffer percentage, and operation multipliers.',
        responses={200: PlatformConfigSerializer}
    )
    def get(self, request):
        config = PlatformConfig.get_active()
        serializer = PlatformConfigSerializer(config)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Super Admin Controls'],
        summary='Update Dynamic Platform Configuration',
        description='Updates platform pricing and quota sliders on the fly without server restarts or code redeployments.',
        request=PlatformConfigSerializer,
        responses={200: PlatformConfigSerializer}
    )
    def post(self, request):
        config = PlatformConfig.get_active()
        serializer = PlatformConfigSerializer(config, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_config = serializer.save()
        return Response({
            'message': 'Platform configuration dynamically updated.',
            'config': PlatformConfigSerializer(updated_config).data
        }, status=status.HTTP_200_OK)
