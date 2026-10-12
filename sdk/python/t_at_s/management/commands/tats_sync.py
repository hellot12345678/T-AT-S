import os
from django.core.management.base import BaseCommand
from django.conf import settings
from t_at_s.client import TATSClient
from t_at_s.registry import registry

class Command(BaseCommand):
    help = 'Synchronizes decorated @tats_action tools to the T@S Acoustic Action Engine'

    def add_arguments(self, parser):
        parser.add_argument('--api-key', type=str, help='T@S Live API Key (tas_live_...)')
        parser.add_argument('--engine-url', type=str, help='T@S Engine Root URL')
        parser.add_argument('--host-url', type=str, help='This application host URL (e.g. https://api.myapp.com)')

    def handle(self, *args, **options):
        api_key = options.get('api_key') or getattr(settings, 'T_AT_S_API_KEY', os.getenv('T_AT_S_API_KEY', ''))
        engine_url = options.get('engine_url') or getattr(settings, 'T_AT_S_ENGINE_URL', os.getenv('T_AT_S_ENGINE_URL', 'http://127.0.0.1:8000'))
        host_url = options.get('host_url') or getattr(settings, 'T_AT_S_HOST_URL', os.getenv('T_AT_S_HOST_URL', ''))

        if not api_key:
            self.stderr.write(self.style.ERROR("Error: T_AT_S_API_KEY is required. Pass --api-key or set in Django settings."))
            return

        actions = registry.list_actions()
        if not actions:
            self.stdout.write(self.style.WARNING("No actions found in ActionRegistry. Did you import your modules with @tats_action?"))
            return

        self.stdout.write(self.style.SUCCESS(f"Found {len(actions)} local actions to sync with T@S Engine ({engine_url})..."))

        client = TATSClient(api_key=api_key, base_url=engine_url)
        res = client.sync_registry(host_base_url=host_url)

        for synced_name in res.get('synced', []):
            self.stdout.write(self.style.SUCCESS(f"  [SYNCED] {synced_name}"))

        for err in res.get('errors', []):
            self.stderr.write(self.style.ERROR(f"  [FAILED] {err['action']}: {err['error']}"))

        self.stdout.write(self.style.SUCCESS(f"\nSync complete! ({res['synced_count']}/{res['total_actions']} tools live on T@S Engine)"))

