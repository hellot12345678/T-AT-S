from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema
from core.models import PlatformConfig
from api.serializers import PlatformConfigSerializer

class AdminConfigView(APIView):
    """
    Super Admin configuration endpoint.
    Retrieves or dynamically updates pricing tiers, unit quotas, and multipliers.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        tags=['Super Admin Controls'],
        summary='Get Dynamic Platform Configuration',
        description='Fetches current platform monetization parameters: starter plan price, free monthly units, grace buffer percentage, and operation multipliers.',
        responses={200: PlatformConfigSerializer}
    )
    def get(self, request):
        config = PlatformConfig.get_active()
        serializer = PlatformConfigSerializer(config)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Super Admin Controls'],
        summary='Update Dynamic Platform Configuration',
        description='Updates platform pricing and quota sliders on the fly without server restarts or code redeployments.',
        request=PlatformConfigSerializer,
        responses={200: PlatformConfigSerializer}
    )
    def post(self, request):
        config = PlatformConfig.get_active()
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if 'starter_price_inr' in data and 'growth_price_inr' not in data:
            data['growth_price_inr'] = data['starter_price_inr']
        elif 'growth_price_inr' in data and 'starter_price_inr' not in data:
            data['starter_price_inr'] = data['growth_price_inr']

        serializer = PlatformConfigSerializer(config, data=data, partial=True)
        if not serializer.is_valid():
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        updated_config = serializer.save()
        return Response({
            'message': 'Platform configuration dynamically updated.',
            'config': PlatformConfigSerializer(updated_config).data
        }, status=status.HTTP_200_OK)


class AdminGovernanceDataView(APIView):
    """
    Super Admin Platform Governance Data:
    Returns 100% REAL live database metrics, registered developers, active application clusters,
    usage metrics, and revenue.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db.models import Sum
        from core.models import Developer, Application, UsageMeter, PaymentOrder, EndUserConfig

        devs_qs = Developer.objects.all().order_by('-created_at')
        apps_qs = Application.objects.all().select_related('developer').order_by('-created_at')

        developers_data = []
        for dev in devs_qs:
            total_consumed = UsageMeter.objects.filter(application__developer=dev).aggregate(Sum('units_consumed'))['units_consumed__sum'] or 0
            developers_data.append({
                'id': str(dev.id),
                'name': dev.name,
                'email': dev.email,
                'phone': dev.phone or '',
                'is_admin': dev.is_admin,
                'is_verified': dev.is_verified,
                'is_active': dev.is_active,
                'created_at': dev.created_at.isoformat(),
                'applications_count': dev.applications.count(),
                'units_used': total_consumed,
                'status': 'Active' if dev.is_active else 'Suspended'
            })

        applications_data = []
        for app in apps_qs:
            monthly_meter = app.usage_meters.order_by('-month_year').first()
            applications_data.append({
                'id': str(app.id),
                'app_name': app.app_name,
                'developer_name': app.developer.name,
                'developer_email': app.developer.email,
                'plan_tier': app.plan_tier,
                'base_url': app.base_url,
                'wake_word_policy': app.wake_word_policy,
                'is_active': app.is_active,
                'units_consumed': monthly_meter.units_consumed if monthly_meter else 0,
                'created_at': app.created_at.isoformat()
            })

        total_units = UsageMeter.objects.aggregate(Sum('units_consumed'))['units_consumed__sum'] or 0
        total_revenue_paise = PaymentOrder.objects.filter(status='PAID').aggregate(Sum('amount'))['amount__sum'] or 0

        end_users_data = []
        for conf in EndUserConfig.objects.all().order_by('-last_active')[:50]:
            end_users_data.append({
                'id': str(conf.id),
                'client_user_id': conf.client_user_id,
                'wake_word': conf.wake_word,
                'passphrase': '••••••••' if conf.passphrase_hash else 'None',
                'voice_tier': conf.voice_tier,
                'is_active': True,
                'created_at': conf.last_active.isoformat() if conf.last_active else ''
            })

        return Response({
            'developers': developers_data,
            'applications': applications_data,
            'end_users': end_users_data,
            'metrics': {
                'total_developers': devs_qs.count(),
                'total_applications': apps_qs.count(),
                'total_units_consumed': total_units,
                'total_revenue_inr': total_revenue_paise / 100,
                'total_end_users': EndUserConfig.objects.count()
            }
        }, status=status.HTTP_200_OK)


class AdminDeveloperStatusView(APIView):
    """
    Allows Platform Administrator to toggle developer account status (Active / Suspended).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, dev_id):
        from core.models import Developer
        try:
            dev = Developer.objects.get(id=dev_id)
            dev.is_active = not dev.is_active
            dev.save()
            return Response({
                'message': f"Developer account status updated to {'Active' if dev.is_active else 'Suspended'}.",
                'is_active': dev.is_active
            }, status=status.HTTP_200_OK)
        except Developer.DoesNotExist:
            return Response({'error': 'Developer not found.'}, status=status.HTTP_404_NOT_FOUND)
