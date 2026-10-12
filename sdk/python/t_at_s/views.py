import json
import os
from typing import Any, Dict
from django.http import JsonResponse, HttpResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .registry import registry

@method_decorator(csrf_exempt, name='dispatch')
class TATSDispatchView(View):
    """
    Webhook receiver endpoint for T@S Acoustic Action Engine calls.
    Routes incoming tool execution requests to the decorated @tats_action functions.
    """

    def post(self, request, action_name: str = None, *args, **kwargs):
        # 1. Verify Service Key if configured
        expected_key = getattr(settings, 'T_AT_S_SERVICE_KEY', os.getenv('T_AT_S_SERVICE_KEY', ''))
        if expected_key:
            incoming_key = request.META.get('HTTP_X_SERVICE_KEY', '')
            if not incoming_key:
                auth_header = request.META.get('HTTP_AUTHORIZATION', '')
                if auth_header.startswith('Bearer '):
                    incoming_key = auth_header.split(' ', 1)[1].strip()

            if incoming_key != expected_key:
                return JsonResponse({'success': False, 'error': 'Unauthorized service key.'}, status=403)

        # 2. Extract Client User ID
        client_user_id = request.META.get('HTTP_X_USER_ID', '')
        if not client_user_id and hasattr(request, 'user') and request.user.is_authenticated:
            client_user_id = str(request.user.id)

        # 3. Parse JSON Body
        try:
            body_data = json.loads(request.body.decode('utf-8')) if request.body else {}
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'error': 'Invalid JSON request payload.'}, status=400)

        # 4. Resolve Action Name and Arguments
        target_action = action_name
        arguments = body_data

        if not target_action:
            # Universal dispatch payload: {"action": "...", "arguments": {...}}
            if 'action' in body_data:
                target_action = body_data.get('action')
                arguments = body_data.get('arguments', {})
            elif 'action_name' in body_data:
                target_action = body_data.get('action_name')
                arguments = body_data.get('arguments', {})

        if not target_action:
            return JsonResponse({
                'success': False,
                'error': 'Action name not specified in URL or payload.',
                'available_actions': list(registry.list_actions().keys())
            }, status=400)

        meta = registry.get(target_action)
        if not meta:
            return JsonResponse({
                'success': False,
                'error': f"Action '{target_action}' is not registered with T@S ActionRegistry.",
                'available_actions': list(registry.list_actions().keys())
            }, status=404)

        # 5. Build Execution Arguments
        exec_kwargs = dict(arguments) if isinstance(arguments, dict) else {}

        if meta.takes_user_id:
            for k in ('user_id', 'client_user_id', 'tats_user_id'):
                if k in meta.func.__code__.co_varnames:
                    exec_kwargs[k] = client_user_id

        if meta.takes_request:
            exec_kwargs['request'] = request

        # 6. Execute Action Function
        try:
            result = meta.func(**exec_kwargs)
            return JsonResponse({
                'success': True,
                'action': target_action,
                'result': result
            }, status=200)
        except TypeError as te:
            return JsonResponse({
                'success': False,
                'action': target_action,
                'error': f"Invalid arguments passed to '{target_action}': {str(te)}"
            }, status=400)
        except Exception as e:
            return JsonResponse({
                'success': False,
                'action': target_action,
                'error': f"Error executing '{target_action}': {str(e)}"
            }, status=500)
