from rest_framework import serializers
from core.models import Application, PlatformConfig, EndUserConfig, UsageMeter
from tools.models import RegisteredTool

class ChatRequestSerializer(serializers.Serializer):
    client_user_id = serializers.CharField(max_length=100, required=True)
    session_id = serializers.CharField(max_length=100, required=True)
    message = serializers.CharField(required=True)
    passphrase = serializers.CharField(max_length=255, required=False, allow_blank=True)
    is_voice = serializers.BooleanField(default=True)


class ToolRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegisteredTool
        fields = ['id', 'name', 'description', 'endpoint', 'method', 'parameters_schema', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        app = self.context['application']
        # Update or create tool cleanly
        tool, _ = RegisteredTool.objects.update_or_create(
            application=app,
            name=validated_data['name'],
            defaults=validated_data
        )
        return tool


class PlatformConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformConfig
        fields = [
            'starter_price_inr',
            'free_tier_units',
            'grace_buffer_pct',
            'cost_per_extra_unit',
            'text_multiplier',
            'voice_multiplier',
            'tool_multiplier',
            'updated_at'
        ]
        read_only_fields = ['updated_at']


class ApplicationDetailSerializer(serializers.ModelSerializer):
    tools_count = serializers.SerializerMethodField()
    monthly_units_used = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['id', 'app_name', 'base_url', 'wake_word_policy', 'is_active', 'tools_count', 'monthly_units_used', 'created_at']

    def get_tools_count(self, obj):
        return obj.tools.filter(is_active=True).count()

    def get_monthly_units_used(self, obj):
        from django.utils import timezone
        month = timezone.now().strftime('%Y-%m')
        meter = obj.usage_meters.filter(month_year=month).first()
        return meter.units_consumed if meter else 0

