"""
Demo Mode Transaction Auto-Completion Command

This command automatically completes transactions that have been "processing" 
for more than 30 seconds in demo/development mode.

Usage:
    python manage.py demo_complete_transactions
    
Or run automatically:
    python manage.py demo_complete_transactions --daemon
"""

import time
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings
from transactions.models import Transaction, TransactionStatus


class Command(BaseCommand):
    help = 'Auto-complete processing transactions in demo mode'

    def add_arguments(self, parser):
        parser.add_argument(
            '--daemon',
            action='store_true',
            help='Run continuously in daemon mode',
        )
        parser.add_argument(
            '--delay',
            type=int,
            default=30,
            help='Seconds to wait before auto-completing transactions (default: 30)',
        )
        parser.add_argument(
            '--check-interval',
            type=int,
            default=10,
            help='Seconds between checks in daemon mode (default: 10)',
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            self.stdout.write(
                self.style.ERROR('❌ This command only runs in DEBUG mode (development)')
            )
            return

        delay = options['delay']
        daemon = options['daemon']
        check_interval = options['check_interval']

        self.stdout.write(
            self.style.SUCCESS(f'🎭 Demo Mode: Auto-completing transactions after {delay}s')
        )

        if daemon:
            self.stdout.write(
                self.style.WARNING(f'🔄 Running in daemon mode (checking every {check_interval}s)')
            )
            while True:
                self.process_transactions(delay)
                time.sleep(check_interval)
        else:
            self.process_transactions(delay)

    def process_transactions(self, delay_seconds):
        """Process and auto-complete old transactions"""
        cutoff_time = timezone.now() - timedelta(seconds=delay_seconds)
        
        # Find processing transactions older than delay
        old_transactions = Transaction.objects.filter(
            status=TransactionStatus.PROCESSING,
            created_at__lt=cutoff_time
        )

        if not old_transactions.exists():
            return

        completed_count = 0
        for tx in old_transactions:
            # 90% success rate in demo mode
            import random
            if random.random() > 0.1:  # 90% success
                tx.status = TransactionStatus.COMPLETED
                tx.completed_at = timezone.now()
                success_msg = "✅"
            else:  # 10% failure for realistic testing
                tx.status = TransactionStatus.FAILED
                tx.failure_reason = "Demo mode: Simulated payment failure"
                success_msg = "❌"
            
            tx.save()
            completed_count += 1
            
            self.stdout.write(
                f'{success_msg} {tx.reference_id}: {tx.amount} {tx.currency} '
                f'({tx.sender.phone_number if tx.sender else "Unknown"} -> {tx.recipient_phone}) '
                f'-> {tx.status}'
            )

        if completed_count > 0:
            self.stdout.write(
                self.style.SUCCESS(f'🎯 Auto-completed {completed_count} transactions')
            )