from django.db import models
from users.models import AppUser
from events.models import EventDetail


class Final(models.Model):
    """Finals created for each event after heats complete"""
    event = models.ForeignKey(
        EventDetail, on_delete=models.CASCADE,
        related_name='finals'
    )
    final_number = models.IntegerField(default=1)

    def __str__(self):
        return f"Final {self.final_number} - {self.event}"


class FinalSwimmer(models.Model):
    """Top 8 finalists + 2 reserves with lane assignments"""

    SWIMMER_TYPE_CHOICES = [
        ('finalist', 'Finalist'),
        ('reserve', 'Reserve'),
    ]

    final = models.ForeignKey(
        Final, on_delete=models.CASCADE,
        related_name='swimmers'
    )
    swimmer = models.ForeignKey(
        AppUser, on_delete=models.PROTECT
    )
    lane_number = models.IntegerField(null=True, blank=True)
    swimmer_type = models.CharField(
        max_length=10,
        choices=SWIMMER_TYPE_CHOICES,
        default='finalist'
    )

    class Meta:
        unique_together = ('final', 'swimmer')
        ordering = ['lane_number']

    def __str__(self):
        return f"{self.swimmer} - Lane {self.lane_number} - {self.final}"


class FinalResult(models.Model):
    """Final race results"""

    STATUS_CHOICES = [

        ('swam', 'Swam'),

        ('DNS', 'Did Not Start'),

        ('DQ', 'Disqualified'),

        ('DNF', 'Did Not Finish'),

        ('NP', 'Not Participating')

    ]

    final = models.ForeignKey(
        Final, on_delete=models.CASCADE,
        related_name='results'
    )
    swimmer = models.ForeignKey(
        AppUser, on_delete=models.PROTECT
    )
    finish_time = models.DurationField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='swam'
    )
    rank = models.IntegerField(null=True, blank=True)
    MEDAL_CHOICES = [
        ('gold', 'Gold'),
        ('silver', 'Silver'),
        ('bronze', 'Bronze'),
        ('none', 'None'),
    ]
    medal = models.CharField(
        max_length=10,
        choices=MEDAL_CHOICES,
        default='none'
    )

    class Meta:
        unique_together = ('final', 'swimmer')
        ordering = ['rank']

    def __str__(self):
        return f"{self.swimmer} - Rank {self.rank} - {self.final}"