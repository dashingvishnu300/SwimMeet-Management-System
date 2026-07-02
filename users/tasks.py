from django.core.mail import send_mail
from django.conf import settings


def send_qualification_email(
        email,
        swimmer_name,
        qualified_to
):

    subject = "Qualification Notification"

    message = (
        f"Congratulations {swimmer_name}!\n\n"
        f"You have qualified for the "
        f"{qualified_to} Championship."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False
    )


def send_result_email(
        email,
        swimmer_name,
        rank
):

    subject = "Meet Results Published"

    message = (
        f"Hello {swimmer_name},\n\n"
        f"Your final rank is {rank}."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False
    )


def send_certificate_email(
        email,
        swimmer_name
):

    subject = "Certificate Available"

    message = (
        f"Hello {swimmer_name},\n\n"
        f"Your certificate is available for download."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False
    )


def send_meet_reminder(
        email,
        swimmer_name,
        meet_name
):

    subject = "Meet Reminder"

    message = (
        f"Hello {swimmer_name},\n\n"
        f"Reminder for {meet_name}."
    )

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False
    )