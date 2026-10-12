from django.contrib import admin
from .models import Developer, Application, APIKey, EndUserConfig, SessionHistory, UsageMeter, PlatformConfig
from tools.models import RegisteredTool

@admin.register(Developer)
class DeveloperAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'created_at')
    search_fields = ('name', 'email')

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('app_name', 'developer', 'base_url', 'wake_word_policy', 'is_active', 'created_at')
    list_filter = ('wake_word_policy', 'is_active')
    search_fields = ('app_name', 'developer__email')

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('key_prefix', 'application', 'is_active', 'created_at')
    list_filter = ('is_active',)

@admin.register(EndUserConfig)
class EndUserConfigAdmin(admin.ModelAdmin):
    list_display = ('client_user_id', 'application', 'wake_word', 'voice_tier', 'last_active')
    list_filter = ('voice_tier',)
    search_fields = ('client_user_id', 'wake_word')

@admin.register(RegisteredTool)
class RegisteredToolAdmin(admin.ModelAdmin):
    list_display = ('name', 'application', 'method', 'endpoint', 'is_active')
    list_filter = ('method', 'is_active')
    search_fields = ('name', 'endpoint')

@admin.register(SessionHistory)
class SessionHistoryAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'client_user_id', 'role', 'tool_name', 'created_at')
    list_filter = ('role', 'tool_name')

@admin.register(UsageMeter)
class UsageMeterAdmin(admin.ModelAdmin):
    list_display = ('application', 'month_year', 'units_consumed', 'bonus_units')

@admin.register(PlatformConfig)
class PlatformConfigAdmin(admin.ModelAdmin):
    list_display = ('starter_price_inr', 'free_tier_units', 'grace_buffer_pct', 'cost_per_extra_unit', 'updated_at')

