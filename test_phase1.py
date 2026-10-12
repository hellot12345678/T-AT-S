import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Developer, Application, APIKey, PlatformConfig
from tools.models import RegisteredTool
from rest_framework.test import APIClient

def test_phase1_engine():
    print("==================================================")
    print("Testing T@S Backend Core Foundation (Phase 1)")
    print("==================================================")

    client = APIClient()

    # 1. Test Health Endpoint (Keep-Alive for UptimeRobot)
    health_res = client.get('/api/v1/health/')
    assert health_res.status_code == 200, f"Health check failed: {health_res.data}"
    print(f"[PASS] Health Probe: {health_res.data}")

    # 2. Setup Test Developer & Application
    dev, _ = Developer.objects.get_or_create(
        email='dev@acme.com',
        defaults={'name': 'Acme Engineering', 'password_hash': 'demo_hashed_secret'}
    )
    raw_service_key = 'tas_sec_demo_982481029410'
    app, _ = Application.objects.get_or_create(
        developer=dev,
        app_name='Acme Task App',
        defaults={
            'base_url': 'https://api.acme.app',
            'service_key_hash': Application.hash_key(raw_service_key),
            'wake_word_policy': 'CUSTOM'
        }
    )

    # 3. Generate Live API Key
    api_key_obj, raw_api_key = APIKey.generate_for_app(app)
    print(f"[PASS] Generated API Key: {raw_api_key}")

    # 4. Test Tool Registration via REST API
    tool_payload = {
        'name': 'create_task',
        'description': 'Creates a project task or reminder in Acme Workspace when user asks to track a todo.',
        'endpoint': '/api/v1/tasks/create/',
        'method': 'POST',
        'parameters_schema': {
            'title': {'type': 'string', 'required': True, 'guide': 'The task title or description'},
            'priority': {'type': 'enum', 'enumValues': ['low', 'medium', 'high'], 'required': False, 'guide': 'Priority level'},
            'due_date': {'type': 'string', 'required': False, 'guide': 'Due date and time'}
        }
    }
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {raw_api_key}')
    tool_res = client.post('/api/v1/tools/register/', data=tool_payload, format='json')
    assert tool_res.status_code == 201, f"Tool registration failed: {tool_res.data}"
    print(f"[PASS] Tool Registered: '{tool_res.data['tool']['name']}'")
    print(f"       Schema generated: {tool_res.data['function_schema']['function']['name']}")

    # 5. Test Tools List Endpoint
    tools_list_res = client.get('/api/v1/tools/')
    assert tools_list_res.status_code == 200
    print(f"[PASS] Tools List verified. Total active tools: {tools_list_res.data['count']}")

    # 6. Test Super Admin Dynamic Config
    admin_res = client.get('/api/v1/admin/config/')
    assert admin_res.status_code == 200
    print(f"[PASS] Super Admin Config Loaded: Free Tier Units = {admin_res.data['free_tier_units']}, Starter Price = INR {admin_res.data['starter_price_inr']}")

    # 7. Test Chat Action Endpoint
    chat_payload = {
        'client_user_id': 'user_rahul_101',
        'session_id': 'sess_test_7781',
        'message': 'Hello T@S, what can you do for me?',
        'is_voice': True
    }
    chat_res = client.post('/api/v1/chat/', data=chat_payload, format='json')
    assert chat_res.status_code == 200, f"Chat call failed: {chat_res.data}"
    print(f"[PASS] Chat Execution Successful!")
    print(f"       Speech Reply: {chat_res.data['reply_speech']}")
    print(f"       Units Deducted: {chat_res.data['units_deducted']}")
    print(f"       Units Remaining: {chat_res.data['units_remaining']}")
    print(f"       Latencies: {chat_res.data['latencies']}")

    print("\n==================================================")
    print("ALL PHASE 1 BACKEND FOUNDATION TESTS PASSED! 100%")
    print("==================================================")

if __name__ == '__main__':
    test_phase1_engine()
