from django.db import models
from users.models import AppUser
from meets.models import Meet


class Certificate(models.Model):

    CERTIFICATE_TYPES = [

        ('participation', 'Participation'),

        ('gold', 'Gold'),

        ('silver', 'Silver'),
        ('bronze', 'Bronze'),

        ('record', 'Record')

    ]

    swimmer = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE
    )

    meet = models.ForeignKey(
        Meet,
        on_delete=models.CASCADE
    )

    certificate_type = models.CharField(
        max_length=20,
        choices=CERTIFICATE_TYPES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    pdf = models.FileField(
        upload_to='certificates/',
        null=True,
        blank=True
    )