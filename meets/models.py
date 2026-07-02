from django.db import models
from users.models import AppUser
from masters.models import Association
from django.core.exceptions import ValidationError

class MeetLevel(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class MeetStatus(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class GenderCategory(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class AgeGroup(models.Model):
    label = models.CharField(max_length=50)
    min_age = models.IntegerField()
    max_age = models.IntegerField()

    def __str__(self):
        return self.label


class DocumentType(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Meet(models.Model):
    CHAMPIONSHIP = "CHAMPIONSHIP"
    INVITATIONAL = "INVITATIONAL"
    TRIAL = "TRIAL"
    SELECTION = "SELECTION"
    OPEN = "OPEN"

    MEET_TYPES = [
        (CHAMPIONSHIP, "Championship"),
        (INVITATIONAL, "Invitational"),
        (TRIAL, "Trial"),
        (SELECTION, "Selection"),
        (OPEN, "Open"),
    ]
    POSITION = "POSITION"
    TIME = "TIME"
    MEDAL = "MEDAL"
    POINTS = "POINTS"

    QUALIFICATION_METHODS = [
        (POSITION, "Position"),
        (TIME, "Time"),
        (MEDAL, "Medal"),
        (POINTS, "Points"),
    ]
    name = models.CharField(max_length=200)
    level = models.ForeignKey(MeetLevel, on_delete=models.PROTECT)
    meet_type = models.CharField(
        max_length=20,
        choices=MEET_TYPES,
        default=CHAMPIONSHIP
    )
    qualifying_position = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Top N swimmers qualify to the next level"
    )
    qualification_method = models.CharField(
        max_length=20,
        choices=QUALIFICATION_METHODS,
        default=POSITION
    )
    qualifying_time_standard = models.DurationField(
        null=True,
        blank=True,
        help_text="Minimum time standard required for qualification"
    )
    qualifying_medals = models.CharField(
        max_length=50,
        blank=True,
        help_text="Comma separated medals allowed to qualify"
    )
    qualifying_points = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Minimum championship points required"
    )
    association = models.ForeignKey(
        Association,
        on_delete=models.PROTECT,
        related_name="meets",
        null=True,
        blank=True
    )

    location = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    max_events_per_swimmer = models.PositiveIntegerField(
        default=5
    )

    gender = models.ForeignKey(GenderCategory, on_delete=models.PROTECT)
    status = models.ForeignKey(MeetStatus, on_delete=models.PROTECT)
    results_published = models.BooleanField(
        default=False
    )
    pool_length = models.IntegerField()
    lanes = models.IntegerField()
    registration_start_date = models.DateField(null=True, blank=True)
    registration_end_date = models.DateField(null=True, blank=True)
    registration_open = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        AppUser, on_delete=models.PROTECT,
        related_name='created_meets'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        AppUser, on_delete=models.PROTECT,
        related_name='updated_meets',
        null=True, blank=True
    )

    def clean(self):

        if not self.association:
            return

        association_type = self.association.association_type
        meet_level = self.level.name.upper()

        if association_type == "DISTRICT":

            if meet_level != "DISTRICT":
                raise ValidationError(
                    "District associations can create only District meets."
                )

        elif association_type == "STATE":

            if meet_level != "STATE":
                raise ValidationError(
                    "State associations can create only State meets."
                )

        elif association_type == "NATIONAL":

            if meet_level != "NATIONAL":
                raise ValidationError(
                    "National associations can create only National meets."
                )

            def save(self, *args, **kwargs):

                self.full_clean()

                super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class MeetDocument(models.Model):
    meet = models.ForeignKey(Meet, on_delete=models.CASCADE)
    type = models.ForeignKey(DocumentType, on_delete=models.PROTECT)
    file_path = models.CharField(max_length=500)
    uploaded_by = models.ForeignKey(AppUser, on_delete=models.PROTECT)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.meet.name} - {self.type.name}"

    from django.db.models.signals import post_save
    from django.dispatch import receiver

    @receiver(post_save, sender=Meet)
    def handle_meet_cancellation(sender, instance, **kwargs):
        """When meet is cancelled, mark all registrations inactive"""
        if instance.status.name == 'cancelled':
            from registrations.models import Registration
            Registration.objects.filter(meet=instance).update(
                is_active=False
        )
