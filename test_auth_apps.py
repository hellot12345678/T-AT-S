from django.test import TestCase
from rest_framework.test import APIClient
from core.models import Developer, Application, APIKey, DeveloperToken, EndUserConfig

class DeveloperAuthAndAppsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_developer_register_login_and_lifecycle(self):
        # 1. Register new developer
        register_payload = {
            'name': 'Test Developer',
            'email': 'dev_test@example.com',
            'password': 'SecurePassword123!'
        }
        reg_res = self.client.post('/api/v1/auth/register/', register_payload, format='json')
        self.assertEqual(reg_res.status_code, 201)
        self.assertIn('token', reg_res.data)
        dev_token = reg_res.data['token']
        self.assertTrue(dev_token.startswith('tas_dev_'))

        # 2. Test duplicate email failure
        dup_res = self.client.post('/api/v1/auth/register/', register_payload, format='json')
        self.assertEqual(dup_res.status_code, 400)

        # 3. Login
        login_res = self.client.post('/api/v1/auth/login/', {
            'email': 'dev_test@example.com',
            'password': 'SecurePassword123!'
        }, format='json')
        self.assertEqual(login_res.status_code, 200)
        self.assertIn('token', login_res.data)
        active_token = login_res.data['token']

        # 4. Get Developer Profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {active_token}')
        me_res = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.data['developer']['email'], 'dev_test@example.com')

        # 5. Create Application
        create_app_res = self.client.post('/api/v1/apps/', {
            'app_name': 'ShopFlow Ecom',
            'base_url': 'http://127.0.0.1:8000',
            'wake_word_policy': 'CUSTOM'
        }, format='json')
        self.assertEqual(create_app_res.status_code, 201)
        app_data = create_app_res.data['application']
        app_id = app_data['id']
        api_key = app_data['api_key']
        service_key = app_data['service_key']
        self.assertTrue(api_key.startswith('tas_live_'))
        self.assertTrue(service_key.startswith('tas_srv_'))

        # 6. List Applications
        list_apps_res = self.client.get('/api/v1/apps/')
        self.assertEqual(list_apps_res.status_code, 200)
        self.assertEqual(list_apps_res.data['count'], 1)

        # 7. Use the newly created API Key to register a tool
        app_client = APIClient()
        app_client.credentials(HTTP_AUTHORIZATION=f'Bearer {api_key}')
        tool_res = app_client.post('/api/v1/tools/register/', {
            'name': 'check_inventory',
            'description': 'Checks stock count for a given item SKU',
            'endpoint': '/api/inventory/check/',
            'method': 'POST',
            'parameters_schema': {
                'sku': {'type': 'string', 'required': True, 'guide': 'Item SKU code'}
            }
        }, format='json')
        self.assertEqual(tool_res.status_code, 201)

        # 8. Test End-User Voice Config
        user_cfg_res = app_client.post('/api/v1/users/cust_001/config/', {
            'wake_word': 'Hey Store',
            'voice_tier': 'BROWSER'
        }, format='json')
        self.assertEqual(user_cfg_res.status_code, 200)
        self.assertEqual(user_cfg_res.data['config']['wake_word'], 'Hey Store')

        # 9. Regenerate API Key
        regen_res = self.client.post(f'/api/v1/apps/{app_id}/regenerate-keys/')
        self.assertEqual(regen_res.status_code, 200)
        new_api_key = regen_res.data['api_key']
        self.assertNotEqual(new_api_key, api_key)

        # Old API key should now be rejected
        old_client = APIClient()
        old_client.credentials(HTTP_AUTHORIZATION=f'Bearer {api_key}')
        rejected_res = old_client.get('/api/v1/tools/')
        self.assertEqual(rejected_res.status_code, 403)

        # New API key should succeed
        fresh_client = APIClient()
        fresh_client.credentials(HTTP_AUTHORIZATION=f'Bearer {new_api_key}')
        allowed_res = fresh_client.get('/api/v1/tools/')
        self.assertEqual(allowed_res.status_code, 200)

        # 10. Logout Developer
        logout_res = self.client.post('/api/v1/auth/logout/')
        self.assertEqual(logout_res.status_code, 200)
