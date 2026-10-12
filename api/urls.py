from django.urls import path
from api.views import (
    HealthCheckView,
    ChatExecutionView,
    ToolManagementView,
    AdminConfigView
)

urlpatterns = [
    # Keep-Alive & Health Monitor
    path('health/', HealthCheckView.as_view(), name='api-health'),

    # Core Agent Execution
    path('chat/', ChatExecutionView.as_view(), name='api-chat'),

    # Tool Registry Endpoints
    path('tools/', ToolManagementView.as_view(), name='api-tools-list'),
    path('tools/register/', ToolManagementView.as_view(), name='api-tools-register'),

    # Super Admin Dynamic Config
    path('admin/config/', AdminConfigView.as_view(), name='api-admin-config'),
]

