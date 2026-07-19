from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class StateMaster(models.Model):
    state_code = models.CharField(
        max_length=10,
        unique=True
    )
    state_name = models.CharField(
        max_length=100,
        unique=True
    )
    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="created_states",
        on_delete=models.SET_NULL
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="updated_states",
        on_delete=models.SET_NULL
    )

    class Meta:
        db_table = "state_master"
        ordering = ["state_name"]
        verbose_name = "State"
        verbose_name_plural = "States"

    def __str__(self):
        return self.state_name

class DistrictMaster(models.Model):
    district_code = models.CharField(
        max_length=50,
        unique=True
    )

    district_name = models.CharField(
        max_length=100
    )

    state = models.ForeignKey(
        "StateMaster",
        on_delete=models.PROTECT,
        related_name="districts"
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="created_districts",
        on_delete=models.SET_NULL
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="updated_districts",
        on_delete=models.SET_NULL
    )

    class Meta:
        db_table = "district_master"

        ordering = ["district_name"]

        unique_together = (
            "district_name",
            "state"
        )

        verbose_name = "District"
        verbose_name_plural = "Districts"

    def __str__(self):
        return f"{self.district_name} ({self.state.state_name})"

class Association(models.Model):

    NATIONAL = "NATIONAL"
    STATE = "STATE"
    DISTRICT = "DISTRICT"

    ASSOCIATION_TYPES = [
        (NATIONAL, "National"),
        (STATE, "State"),
        (DISTRICT, "District"),
    ]

    association_code = models.CharField(
        max_length=50,
        unique=True
    )

    association_name = models.CharField(
        max_length=255,
        unique=True
    )

    association_type = models.CharField(
        max_length=50,
        choices=ASSOCIATION_TYPES
    )

    state = models.ForeignKey(
        StateMaster,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="associations"
    )

    district = models.ForeignKey(
        DistrictMaster,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="associations"
    )

    email = models.EmailField(
        blank=True
    )

    phone = models.CharField(
        max_length=50,
        blank=True
    )

    address = models.TextField(
        blank=True
    )

    website = models.URLField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="created_associations",
        on_delete=models.SET_NULL
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="updated_associations",
        on_delete=models.SET_NULL
    )

    class Meta:
        db_table = "association"

        ordering = [
            "association_name"
        ]

        verbose_name = "Association"

        verbose_name_plural = "Associations"

    def clean(self):

        if self.association_type == self.NATIONAL:

            if self.state or self.district:
                raise ValidationError(
                    "National association cannot have state or district."
                )

        elif self.association_type == self.STATE:

            if not self.state:
                raise ValidationError(
                    "State association must have a state."
                )

            if self.district:
                raise ValidationError(
                    "State association cannot have district."
                )

        elif self.association_type == self.DISTRICT:

            if not self.state:
                raise ValidationError(
                    "District association must have state."
                )

            if not self.district:
                raise ValidationError(
                    "District association must have district."
                )

    def save(self, *args, **kwargs):

            self.full_clean()

            super().save(*args, **kwargs)



    def __str__(self):
        return self.association_name