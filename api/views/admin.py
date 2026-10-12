from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from core.models import PlatformConfig
from api.serializers import PlatformConfigSerializer

class AdminConfigView(APIView):
    """
    Super Admin configuration endpoint.
    Retrieves or dynamically updates pricing tiers, unit quotas, and multipliers.
    """
    permission_classes = [permissions.AllowAny] # In production, protected by admin secret token or JWT

    def get(self, request):
        config = PlatformConfig.get_active()
        serializer = PlatformConfigSerializer(config)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

