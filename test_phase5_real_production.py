import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import TestCase
from rest_framework.test import APIClient
from core.models import Developer, DeveloperToken, EmailOTPVerification, Notification, PaymentOrder, Application

class ProductionAuthPaymentNotificationsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_full_production_lifecycle(self):
        print("=== 1. Check System Status (Initial Setup) ===")
        res = self.client.get('/api/v1/auth/system-status/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['first_user_becomes_admin'])

        print("=== 2. Test Invalid Phone Rejection ===")
        res_bad_phone = self.client.post('/api/v1/auth/register/', {
            'name': 'Admin User',
            'email': 'admin@tats.ai',
            'phone': '12345', # Invalid phone
            'password': 'StrongPassword123@'
        }, format='json')
        self.assertEqual(res_bad_phone.status_code, 400)
        self.assertIn('valid 10-digit Indian mobile', res_bad_phone.data['error'])

        print("=== 3. Test Weak Password Rejection ===")
        res_weak_pw = self.client.post('/api/v1/auth/register/', {
            'name': 'Admin User',
            'email': 'admin@tats.ai',
            'phone': '+91 9876543210',
            'password': 'weak' # Too short
        }, format='json')
        self.assertEqual(res_weak_pw.status_code, 400)

        print("=== 4. Register First User (Becomes Platform Admin) ===")
        reg_res = self.client.post('/api/v1/auth/register/', {
            'name': 'Lead Architect',
            'email': 'admin@tats.ai',
            'phone': '9876543210',
            'password': 'StrongAdminPassword123@'
        }, format='json')
        self.assertEqual(reg_res.status_code, 201)
        self.assertTrue(reg_res.data['requires_otp'])
        self.assertTrue(reg_res.data['is_admin'])

        print("=== 5. Verify OTP for First User ===")
        # Fetch OTP record
        otp_record = EmailOTPVerification.objects.filter(email='admin@tats.ai', purpose='REGISTER').first()
        self.assertIsNotNone(otp_record)

        # Intentionally find valid code by simulating OTP match
        # Let's test with wrong OTP first
        bad_otp_res = self.client.post('/api/v1/auth/verify-otp/', {
            'email': 'admin@tats.ai',
            'otp': '000000',
            'purpose': 'REGISTER'
        }, format='json')
        self.assertEqual(bad_otp_res.status_code, 400)

        # Now test with valid code: create known OTP
        from django.contrib.auth.hashers import make_password
        otp_record.otp_hash = make_password('123456')
        otp_record.save()

        verify_res = self.client.post('/api/v1/auth/verify-otp/', {
            'email': 'admin@tats.ai',
            'otp': '123456',
            'purpose': 'REGISTER'
        }, format='json')
        self.assertEqual(verify_res.status_code, 200)
        self.assertIn('token', verify_res.data)
        admin_token = verify_res.data['token']
        self.assertTrue(verify_res.data['developer']['is_admin'])

        print("=== 6. Verify Notifications Created ===")
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        notif_res = self.client.get('/api/v1/notifications/')
        self.assertEqual(notif_res.status_code, 200)
        self.assertEqual(notif_res.data['unread_count'], 1)
        notif_id = notif_res.data['notifications'][0]['id']

        # Mark notification as read
        read_res = self.client.post(f'/api/v1/notifications/{notif_id}/read/')
        self.assertEqual(read_res.status_code, 200)

        print("=== 7. Provision Application Cluster ===")
        app_res = self.client.post('/api/v1/apps/', {
            'app_name': 'Production Engine',
            'base_url': 'https://api.mycluster.internal',
            'wake_word_policy': 'CUSTOM'
        }, format='json')
        self.assertEqual(app_res.status_code, 201)
        app_id = app_res.data['application']['id']

        print("=== 8. Create Razorpay Payment Order ===")
        order_res = self.client.post('/api/v1/payments/create-order/', {
            'app_id': app_id,
            'plan_tier': 'GROWTH_STARTUP'
        }, format='json')
        self.assertEqual(order_res.status_code, 201)
        self.assertIn('order_id', order_res.data)
        self.assertEqual(order_res.data['amount'], 499900) # ₹4,999 in paise
        order_id = order_res.data['order_id']

        print("=== 9. Verify Razorpay Payment Signature & Upgrade ===")
        verify_pay_res = self.client.post('/api/v1/payments/verify/', {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': 'pay_live_84719201',
            'razorpay_signature': 'simulated_sig_ok',
            'app_id': app_id
        }, format='json')
        self.assertEqual(verify_pay_res.status_code, 200)
        self.assertTrue(verify_pay_res.data['success'])
        self.assertEqual(verify_pay_res.data['units_credited'], 50000)

        # Check that application was upgraded to GROWTH
        app_obj = Application.objects.get(id=app_id)
        self.assertEqual(app_obj.plan_tier, 'GROWTH')

        # Check billing notification generated
        notif_res2 = self.client.get('/api/v1/notifications/')
        self.assertEqual(notif_res2.data['notifications'][0]['notification_type'], 'BILLING')

        print("=== 10. Forgot Password & Reset Password Flow ===")
        forgot_res = self.client.post('/api/v1/auth/forgot-password/', {
            'email': 'admin@tats.ai'
        }, format='json')
        self.assertEqual(forgot_res.status_code, 200)

        # Set known OTP
        reset_otp = EmailOTPVerification.objects.filter(email='admin@tats.ai', purpose='FORGOT_PASSWORD').first()
        reset_otp.otp_hash = make_password('654321')
        reset_otp.save()

        reset_res = self.client.post('/api/v1/auth/reset-password/', {
            'email': 'admin@tats.ai',
            'otp': '654321',
            'new_password': 'BrandNewStrongPassword123@'
        }, format='json')
        self.assertEqual(reset_res.status_code, 200)
        self.assertIn('token', reset_res.data)

        print("==================================================")
        print("[SUCCESS] ALL PRODUCTION BACKEND CHECKS PASSED 100%!")
        print("==================================================")

