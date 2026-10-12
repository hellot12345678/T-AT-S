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


from drf_spectacular.utils import extend_schema_field

class ApplicationDetailSerializer(serializers.ModelSerializer):
    tools_count = serializers.SerializerMethodField()
    monthly_units_used = serializers.SerializerMethodField()
    api_keys_count = serializers.SerializerMethodField()
    api_key_prefix = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ['id', 'app_name', 'base_url', 'wake_word_policy', 'plan_tier', 'is_active', 'tools_count', 'monthly_units_used', 'api_keys_count', 'api_key_prefix', 'created_at']

    @extend_schema_field(int)
    def get_tools_count(self, obj) -> int:
        return obj.tools.filter(is_active=True).count()

    @extend_schema_field(int)
    def get_monthly_units_used(self, obj) -> int:
        from django.utils import timezone
        month = timezone.now().strftime('%Y-%m')
        meter = obj.usage_meters.filter(month_year=month).first()
        return meter.units_consumed if meter else 0

    @extend_schema_field(int)
    def get_api_keys_count(self, obj) -> int:
        return obj.api_keys.filter(is_active=True).count()

    @extend_schema_field(str)
    def get_api_key_prefix(self, obj) -> str:
        key = obj.api_keys.filter(is_active=True).first()
        return key.key_prefix if key else ""



class DeveloperRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=150, default="Developer", required=False)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(max_length=128, write_only=True, required=True)


class DeveloperLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(max_length=128, write_only=True, required=True)


class DeveloperProfileSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    applications_count = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class ApplicationCreateSerializer(serializers.Serializer):
    app_name = serializers.CharField(max_length=100, required=True, help_text="Name of your app, e.g. 'Foodie Express'")
    base_url = serializers.URLField(max_length=255, required=True, help_text="Backend webhook root URL, e.g. 'http://localhost:8000'")
    wake_word_policy = serializers.ChoiceField(
        choices=Application.WAKE_WORD_POLICY_CHOICES,
        default='CUSTOM',
        help_text="'LOCKED' to app name or 'CUSTOM' allowing end-users their own wake word"
    )


class ApplicationCreatedResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    app_name = serializers.CharField()
    base_url = serializers.URLField()
    wake_word_policy = serializers.CharField()
    api_key = serializers.CharField(help_text="Raw live API key: Bearer tas_live_... (save this!)")
    service_key = serializers.CharField(help_text="Service verification key: tas_srv_... (save this!)")
    created_at = serializers.DateTimeField()


class EndUserConfigSerializer(serializers.ModelSerializer):
    passphrase = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = EndUserConfig
        fields = ['id', 'client_user_id', 'wake_word', 'voice_tier', 'passphrase', 'last_active']
        read_only_fields = ['id', 'last_active']


