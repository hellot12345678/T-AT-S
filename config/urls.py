from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # T@S REST API v1
    path('api/v1/', include('api.urls')),
]

