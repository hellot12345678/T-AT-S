import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

class HealthCheckView(APIView):
    """
    Lightweight keep-alive probe pinged by UptimeRobot every 10 minutes.
    0ms cold start, zero database overhead.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'T@S Acoustic Action Engine',
            'version': '1.0.0',
            'timestamp': int(time.time()),
        }, status=status.HTTP_200_OK)

