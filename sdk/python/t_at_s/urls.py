from django.urls import path
from .views import TATSDispatchView

app_name = 't_at_s'

urlpatterns = [
    # Universal dispatcher: POST /api/tats/dispatch/
    path('dispatch/', TATSDispatchView.as_view(), name='dispatch'),

    # Direct action dispatcher: POST /api/tats/actions/<action_name>/
    path('actions/<str:action_name>/', TATSDispatchView.as_view(), name='action_dispatch'),
]
