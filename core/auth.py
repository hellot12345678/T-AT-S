import hashlib
from rest_framework import authentication, exceptions
from .models import APIKey, Application

class APIKeyAuthentication(authentication.BaseAuthentication):
    """
    Authenticates requests using Bearer token format:
    Authorization: Bearer tas_live_...
    """
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            # Check query param fallback or X-API-KEY header
            auth_header = request.headers.get('X-Api-Key') or request.query_params.get('api_key')
            if not auth_header:
                return None
            raw_key = auth_header.strip()
        else:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                raw_key = parts[1].strip()
            elif len(parts) == 1:
                raw_key = parts[0].strip()
            else:
                return None

        if not raw_key.startswith('tas_live_'):
            return None

        key_hash = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
        try:
            api_key = APIKey.objects.select_related('application', 'application__developer').get(
                key_hash=key_hash,
                is_active=True
            )
        except APIKey.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid or inactive T@S API Key.')

        if not api_key.application.is_active:
            raise exceptions.PermissionDenied('This application cluster is suspended by Platform Admin.')

        # Attach application directly to request for tenancy scoping
        request.application = api_key.application
        request.developer = api_key.application.developer
        return (api_key.application, api_key)

