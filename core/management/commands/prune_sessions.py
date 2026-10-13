from django.core.management.base import BaseCommand
from django.conf import settings
from core.models import SessionHistory, Application


class Command(BaseCommand):
    help = 'Auto-delete old session histories and retain only the newest N sessions per application (default 300).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep',
            type=int,
            default=getattr(settings, 'MAX_SESSION_HISTORY_PER_APP', 300),
            help='Number of newest sessions to retain per application (default: 300)'
        )

    def handle(self, *args, **options):
        keep = options['keep']
        self.stdout.write(f"Pruning session histories, keeping newest {keep} per application...")
        total_deleted = SessionHistory.prune_old_sessions(application=None, max_keep=keep)
        self.stdout.write(self.style.SUCCESS(f"Successfully pruned {total_deleted} old session histories."))

        for app in Application.objects.all():
            cnt = app.sessions.count()
            self.stdout.write(f" - Application '{app.app_name}': {cnt} sessions retained.")

