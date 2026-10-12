import os
from typing import Optional

class TATSMiddleware:
    """
    Django middleware for T@S Acoustic Action Engine integration.
    Extracts end-user tenancy headers (X-User-Id) and verifies service keys.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extract T@S headers
        raw_user_id = request.META.get('HTTP_X_USER_ID', '')
        service_key = request.META.get('HTTP_X_SERVICE_KEY', '')

        # Check Authorization header fallback: Bearer <service_key>
        if not service_key:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                service_key = auth_header.split(' ', 1)[1].strip()

        request.tats_user_id = raw_user_id or None
        request.tats_service_key = service_key or None
        request.is_tats_dispatch = bool(raw_user_id or service_key or 'HTTP_USER_AGENT' in request.META and 'T@S' in request.META['HTTP_USER_AGENT'])

        response = self.get_response(request)
        return response

