from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from core.models import Notification
from core.auth import DeveloperTokenAuthentication, IsDeveloperAuthenticated
from api.serializers import NotificationSerializer

class NotificationListView(APIView):
    """
    Lists notifications for the authenticated developer with filtering and search support.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='List Developer Notifications',
        description='Fetches real-time alert and activity notifications for developer with unread count and filters.',
        responses={200: NotificationSerializer(many=True)}
    )
    def get(self, request):
        dev = request.developer
        limit_param = request.query_params.get('limit')
        category = request.query_params.get('type')
        unread_only = request.query_params.get('unread') == 'true'
        search = request.query_params.get('q', '').strip()

        qs = Notification.objects.filter(developer=dev).order_by('-created_at')
        if category and category != 'ALL':
            qs = qs.filter(notification_type=category.upper())
        if unread_only:
            qs = qs.filter(is_read=False)
        if search:
            from django.db.models import Q
            qs = qs.filter(Q(title__icontains=search) | Q(message__icontains=search))

        unread_count = Notification.objects.filter(developer=dev, is_read=False).count()
        total_count = Notification.objects.filter(developer=dev).count()

        if limit_param:
            try:
                qs = qs[:int(limit_param)]
            except ValueError:
                qs = qs[:50]
        else:
            qs = qs[:150]

        serializer = NotificationSerializer(qs, many=True)
        return Response({
            'unread_count': unread_count,
            'total_count': total_count,
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


class NotificationDeleteView(APIView):
    """
    Deletes a single notification by ID.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='Delete Notification',
        description='Deletes a specific notification from developer history.'
    )
    def delete(self, request, notification_id):
        dev = request.developer
        deleted_count, _ = Notification.objects.filter(id=notification_id, developer=dev).delete()
        if deleted_count > 0:
            return Response({'message': 'Notification deleted successfully.'}, status=status.HTTP_200_OK)
        return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


class NotificationClearAllView(APIView):
    """
    Deletes all notifications for developer.
    """
    authentication_classes = [DeveloperTokenAuthentication]
    permission_classes = [IsDeveloperAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='Clear All Notifications',
        description='Deletes all notification records for the authenticated developer.'
    )
    def delete(self, request):
        dev = request.developer
        Notification.objects.filter(developer=dev).delete()
        return Response({'message': 'All notifications cleared.'}, status=status.HTTP_200_OK)

