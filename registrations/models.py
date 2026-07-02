from django.db import models
from django.core.exceptions import ValidationError

from users.models import AppUser
from meets.models import Meet
from events.models import EventDetail
from users.utils import get_age_group

class Registration(models.Model):
    """
    District level:
    Swimmer registers themselves
    (nominated_by = swimmer)

    State level:
    District organizer nominates swimmers
    (nominated_by = district organizer)

    National level:
    State organizer nominates swimmers
    (nominated_by = state organizer)
    """

    DISTRICT_TO_STATE = "DISTRICT_TO_STATE"
    STATE_TO_NATIONAL = "STATE_TO_NATIONAL"

    QUALIFICATION_TYPES = [
        (DISTRICT_TO_STATE, "District to State"),
        (STATE_TO_NATIONAL, "State to National"),
    ]

    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

    QUALIFICATION_STATUSES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
    ]

    meet = models.ForeignKey(
        Meet,
        on_delete=models.CASCADE,
        related_name="registrations"
    )

    swimmer = models.ForeignKey(
        AppUser,
        on_delete=models.PROTECT,
        related_name="registrations"
    )

    nominated_by = models.ForeignKey(
        AppUser,
        on_delete=models.PROTECT,
        related_name="nominations"
    )

    qualification_source_meet = models.ForeignKey(
        Meet,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="qualified_registrations"
    )

    event = models.ForeignKey(
        EventDetail,
        on_delete=models.PROTECT
    )

    qualification_type = models.CharField(
        max_length=30,
        choices=QUALIFICATION_TYPES,
        null=True,
        blank=True
    )

    qualification_status = models.CharField(
        max_length=20,
        choices=QUALIFICATION_STATUSES,
        default=PENDING
    )

    approved_by = models.ForeignKey(
        AppUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_registrations"
    )

    approved_at = models.DateTimeField(
        null=True,
        blank=True
    )

    rejection_reason = models.TextField(
        blank=True
    )

    qualified_for_next_level = models.BooleanField(
        default=False
    )

    qualification_position = models.IntegerField(
        null=True,
        blank=True
    )
    qualification_medal = models.CharField(
        max_length=10,
        blank=True
    )
    qualification_time = models.DurationField(
        null=True,
        blank=True
    )

    qualified_at = models.DateTimeField(
        null=True,
        blank=True
    )

    qualified_by_result = models.ForeignKey(
        "results.FinalResult",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    seed_time = models.DurationField(
        null=True,
        blank=True,
        help_text="Swimmer best time for seeding heats"
    )

    registered_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    sent_back = models.BooleanField(
        default=False
    )

    recall = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        unique_together = ("meet", "swimmer", "event")

    def clean(self):

        current_count = Registration.objects.filter(

            meet=self.meet,

            swimmer=self.swimmer

        ).exclude(

            pk=self.pk

        ).count()

        if current_count >= self.meet.max_events_per_swimmer:
            raise ValidationError(

                f'A swimmer can register for at most '

                f'{self.meet.max_events_per_swimmer} events.'

            )
        age_group = get_age_group(

            self.swimmer.date_of_birth,

            self.meet.start_date

        )

        event_list = self.event.event_list

        if (

                age_group == "sub_junior"

                and

                not event_list.is_sub_junior

        ):

            raise ValidationError(

                "This event is not available for Sub Junior swimmers."

            )

        elif (

                age_group == "junior"

                and

                not event_list.is_junior

        ):

            raise ValidationError(

                "This event is not available for Junior swimmers."

            )

        elif (

                age_group == "senior"

                and

                not event_list.is_senior

        ):

            raise ValidationError(

                "This event is not available for Senior swimmers."

            )

        meet_level = self.meet.level.name.upper()

        if meet_level == "DISTRICT":

            if self.swimmer != self.nominated_by:
                raise ValidationError(
                    "Swimmers must self-register for district meets."
                )

        elif meet_level == "STATE":

            # Only organizers can nominate swimmers
            if self.nominated_by.role.name.lower() != "organizer":
                raise ValidationError(
                    "Only organizers can register swimmers for state meets."
                )

            # Must be a STATE association organizer
            if self.nominated_by.association.association_type != "STATE":
                raise ValidationError(
                    "Only State organizers can register swimmers for State meets."
                )

            # Swimmer must belong to the same state
            if (
                    self.swimmer.state_master
                    != self.nominated_by.state_master
            ):
                raise ValidationError(
                    "State organizers can register only swimmers from their own state."
                )
            # State organizer must register swimmers only
            # in their own State Championship

            if (
                    self.meet.association
                    != self.nominated_by.association
            ):
                raise ValidationError(
                    "State organizers can register swimmers only in their own State Championship."
                )

            # Swimmer must already be qualified
            if self.qualification_type != self.DISTRICT_TO_STATE:
                raise ValidationError(
                    "Invalid qualification type for State meet."
                )

            if not self.qualification_source_meet:
                raise ValidationError(
                    "Qualification source meet is required."
                )

            if (
                    self.qualification_source_meet.meet_type
                    != "CHAMPIONSHIP"
            ):
                raise ValidationError(
                    "Only championship meets can be used for qualification."
                )

            if (
                    self.qualification_source_meet.level.name.upper()
                    != "DISTRICT"
            ):
                raise ValidationError(
                    "Qualification source must be a District meet."
                )


        elif meet_level == "NATIONAL":

            # Only organizers can register swimmers

            if self.nominated_by.role.name.lower() != "organizer":
                raise ValidationError(

                    "Only organizers can register swimmers for National meets."

                )

            # Must be NATIONAL association organizer

            if (

                    self.nominated_by.association is None

                    or

                    self.nominated_by.association.association_type != "NATIONAL"

            ):
                raise ValidationError(

                    "Only National organizers can register swimmers for National meets."

                )

            # Qualification type

            if self.qualification_type != self.STATE_TO_NATIONAL:
                raise ValidationError(

                    "Invalid qualification type for National meet."

                )

            # Qualification source meet

            if not self.qualification_source_meet:
                raise ValidationError(

                    "Qualification source meet is required."

                )

            if (

                    self.qualification_source_meet.meet_type

                    != "CHAMPIONSHIP"

            ):
                raise ValidationError(

                    "Only championship meets can be used for qualification."

                )

            if (

                    self.qualification_source_meet.level.name.upper()

                    != "STATE"

            ):
                raise ValidationError(

                    "Qualification source must be a State meet."

                )

            # National meet must belong to National Association

            if (

                    self.meet.association

                    != self.nominated_by.association

            ):
                raise ValidationError(

                    "National organizers can register swimmers only in National Championships."

                )

        if (
                self.qualification_status == self.APPROVED
                and
                not self.approved_by
        ):
            raise ValidationError(
                "Approved registrations must have approved_by."
            )

        if (
                self.qualification_status == self.REJECTED
                and
                not self.rejection_reason
        ):
            raise ValidationError(
                "Rejected registrations must include rejection reason."
            )



    def save(self, *args, **kwargs):

        self.full_clean()

        super().save(*args, **kwargs)

    def __str__(self):

        return (
            f"{self.swimmer} - "
            f"{self.event} - "
            f"{self.meet}"
        )


class SwimmerBestTime(models.Model):
    """
    Personal best times per swimmer per event
    """

    swimmer = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,
        related_name="best_times"
    )

    event_list = models.ForeignKey(
        "events.EventList",
        on_delete=models.PROTECT
    )

    best_time = models.DurationField()

    recorded_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = ("swimmer", "event_list")

    def __str__(self):

        return (
            f"{self.swimmer} - "
            f"{self.event_list} - "
            f"{self.best_time}"
        )