from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from core.models import Notification
from core.auth import DeveloperTokenAuthentication, IsDeveloperAuthenticated
from api.serializers import NotificationSerializer

class NotificationListView(APIView):
    """
    Lists notifications for the authenticated developer.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='List Developer Notifications',
        description='Fetches real-time alert and activity notifications for developer with unread count.',
        responses={200: NotificationSerializer(many=True)}
    )
    def get(self, request):
        dev = request.developer
        notifications = Notification.objects.filter(developer=dev).order_by('-created_at')[:30]
        unread_count = Notification.objects.filter(developer=dev, is_read=False).count()
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            'unread_count': unread_count,
            'notifications': serializer.data
        }, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    """
    Marks a single notification as read.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='Mark Notification Read',
        description='Marks a specific notification ID as read.'
    )
    def post(self, request, notification_id):
        dev = request.developer
        try:
            notification = Notification.objects.get(id=notification_id, developer=dev)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Marked as read.'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadView(APIView):
    """
    Marks all notifications for developer as read.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='Mark All Notifications Read',
        description='Marks all unread notifications for developer as read.'
    )
    def post(self, request):
        dev = request.developer
        Notification.objects.filter(developer=dev, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'}, status=status.HTTP_200_OK)
