import uuid
import hashlib
from django.db import models
from django.utils import timezone

class Developer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, default="Developer")
    email = models.EmailField(unique=True)
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"


class Application(models.Model):
    WAKE_WORD_POLICY_CHOICES = [
        ('LOCKED', 'Locked to App Name'),
        ('CUSTOM', 'Allow End-User Custom'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    developer = models.ForeignKey(Developer, on_delete=models.CASCADE, related_name='applications')
    app_name = models.CharField(max_length=100)
    base_url = models.URLField(max_length=255, help_text="Root API URL of the developer application")
    service_key_hash = models.CharField(max_length=255)
    wake_word_policy = models.CharField(max_length=20, choices=WAKE_WORD_POLICY_CHOICES, default='CUSTOM')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.app_name} ({self.developer.email})"

    @staticmethod
    def hash_key(raw_key: str) -> str:
        return hashlib.sha256(raw_key.strip().encode('utf-8')).hexdigest()

    def verify_service_key(self, raw_key: str) -> bool:
        return self.service_key_hash == self.hash_key(raw_key)


class APIKey(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='api_keys')
    key_prefix = models.CharField(max_length=16, help_text="e.g. tas_live_a89...")
    key_hash = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"APIKey {self.key_prefix}... for {self.application.app_name}"

    @classmethod
    def generate_for_app(cls, application: Application):
        raw_key = f"tas_live_{uuid.uuid4().hex}"
        key_prefix = raw_key[:14]
        key_hash = hashlib.sha256(raw_key.encode('utf-8')).hexdigest()
        instance = cls.objects.create(
            application=application,
            key_prefix=key_prefix,
            key_hash=key_hash,
            is_active=True
        )
        return instance, raw_key


class EndUserConfig(models.Model):
    VOICE_TIER_CHOICES = [
        ('BROWSER', 'Browser Built-in (Free)'),
        ('LIBRARY', 'Curated Studio Library (Aura)'),
        ('CLONED', 'Zero-Shot 6-Sec Cloned'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='end_users')
    client_user_id = models.CharField(max_length=100, help_text="User ID passed by client app")
    wake_word = models.CharField(max_length=60, default="Hey T@S")
    passphrase_hash = models.CharField(max_length=255, blank=True, null=True)
    voice_tier = models.CharField(max_length=20, choices=VOICE_TIER_CHOICES, default='BROWSER')
    voice_vector = models.JSONField(blank=True, null=True, help_text="Latent embedding vector for voice cloning")
    last_active = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('application', 'client_user_id')

    def __str__(self):
        return f"User {self.client_user_id} @ {self.application.app_name}"


class SessionHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='sessions')
    session_id = models.CharField(max_length=100, db_index=True)
    client_user_id = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant'), ('system', 'System')])
    content = models.TextField()
    tool_name = models.CharField(max_length=100, blank=True, null=True)
    tool_payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.session_id}] {self.role}: {self.content[:40]}"


class UsageMeter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='usage_meters')
    month_year = models.CharField(max_length=7, help_text="Format: YYYY-MM")
    units_consumed = models.PositiveIntegerField(default=0)
    bonus_units = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('application', 'month_year')

    def __str__(self):
        return f"{self.application.app_name} - {self.month_year}: {self.units_consumed} units"


class PlatformConfig(models.Model):
    """Singleton model controlled dynamically by Super Admin."""
    starter_price_inr = models.PositiveIntegerField(default=799)
    free_tier_units = models.PositiveIntegerField(default=2000)
    grace_buffer_pct = models.PositiveIntegerField(default=10)
    cost_per_extra_unit = models.DecimalField(max_digits=6, decimal_places=4, default=0.0400)
    text_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.0)
    voice_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=2.0)
    tool_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=3.0)
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_active(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj

    def __str__(self):
        return f"PlatformConfig (Free: {self.free_tier_units} units, Starter: ₹{self.starter_price_inr})"

