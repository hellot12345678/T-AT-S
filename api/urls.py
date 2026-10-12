from django.urls import path
from api.views import (
    HealthCheckView,
    ChatExecutionView,
    ToolManagementView,
    AdminConfigView,
    DeveloperRegisterView,
    DeveloperLoginView,
    DeveloperLogoutView,
    DeveloperMeView,
    ApplicationListCreateView,
    ApplicationDetailView,
    ApplicationKeyRegenerateView,
    ApplicationSessionsView,
    EndUserConfigView,
    ApplicationUsageView,
    ApplicationAddBonusView,
    ApplicationUpgradeView
)

urlpatterns = [
    # Developer Authentication & Lifecycle
    path('auth/register/', DeveloperRegisterView.as_view(), name='api-auth-register'),
    path('auth/login/', DeveloperLoginView.as_view(), name='api-auth-login'),
    path('auth/logout/', DeveloperLogoutView.as_view(), name='api-auth-logout'),
    path('auth/me/', DeveloperMeView.as_view(), name='api-auth-me'),

    # Developer Applications & API Key Management
    path('apps/', ApplicationListCreateView.as_view(), name='api-apps-list-create'),
    path('apps/<uuid:app_id>/', ApplicationDetailView.as_view(), name='api-apps-detail'),
    path('apps/<uuid:app_id>/regenerate-keys/', ApplicationKeyRegenerateView.as_view(), name='api-apps-regenerate-keys'),
    path('apps/<uuid:app_id>/sessions/', ApplicationSessionsView.as_view(), name='api-apps-sessions'),

    # Quota Metering, Bonus & Plan Upgrade
    path('apps/<uuid:app_id>/usage/', ApplicationUsageView.as_view(), name='api-apps-usage'),
    path('apps/<uuid:app_id>/add-bonus/', ApplicationAddBonusView.as_view(), name='api-apps-add-bonus'),
    path('apps/<uuid:app_id>/upgrade/', ApplicationUpgradeView.as_view(), name='api-apps-upgrade'),


    # End-User Voice Preferences & Security
    path('users/<str:client_user_id>/config/', EndUserConfigView.as_view(), name='api-user-config'),

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


