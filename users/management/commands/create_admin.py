import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Creates an admin user if one does not already exist."

    def handle(self, *args, **options):

        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(
                self.style.SUCCESS("Superuser already exists.")
            )
            return

        email = os.environ.get("ADMIN_EMAIL")
        password = os.environ.get("ADMIN_PASSWORD")
        name = os.environ.get("ADMIN_NAME", "Admin")

        if not email or not password:
            self.stdout.write(
                self.style.ERROR(
                    "ADMIN_EMAIL or ADMIN_PASSWORD environment variables are missing."
                )
            )
            return

        User.objects.create_superuser(
            email=email,
            username=name,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS(f"Superuser '{email}' created successfully.")
        )