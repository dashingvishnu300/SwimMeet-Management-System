from django.core.mail import send_mail
from django.conf import settings


class EmailService:

    @staticmethod
    def send_temporary_password(
        user,
        temporary_password
    ):

        send_mail(

            subject="SwimMeet Temporary Password",

            message=(
                f"Hello {user.first_name},\n\n"
                f"Your temporary password is:\n\n"
                f"{temporary_password}\n\n"
                f"You must change your password "
                f"after your first login."
            ),

            from_email=settings.DEFAULT_FROM_EMAIL,

            recipient_list=[user.email],

            fail_silently=False

        )