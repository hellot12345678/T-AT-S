import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema

class HealthCheckView(APIView):
    """
    Lightweight keep-alive probe pinged by UptimeRobot every 10 minutes.
    0ms cold start, zero database overhead.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Health & Keep-Alive'],
        summary='UptimeRobot 24/7 Keep-Alive Probe',
        description='Returns HTTP 200 OK in < 5ms. Pinged every 10 minutes by UptimeRobot to prevent Render compute from spinning down.',
        responses={200: dict}
    )
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'T@S Acoustic Action Engine',
            'version': '1.0.0',
            'timestamp': int(time.time()),
        }, status=status.HTTP_200_OK)
