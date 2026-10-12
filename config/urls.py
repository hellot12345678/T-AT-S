from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # T@S REST API v1
    path('api/v1/', include('api.urls')),

    # Swagger / OpenAPI 3.0 Documentation Endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-docs'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
