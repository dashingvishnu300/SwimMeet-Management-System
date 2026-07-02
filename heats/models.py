from django.db import models
from users.models import AppUser
from events.models import EventDetail


class HeatList(models.Model):
    """Heats created for each event"""

    STATUS_CHOICES = [

        ('not_swam', 'Not Swam'),

        ('in_progress', 'In Progress'),

        ('completed', 'Completed')

    ]

    event = models.ForeignKey(
        EventDetail, on_delete=models.CASCADE,
        related_name='heats'
    )
    heat_number = models.IntegerField()
    heat_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='not_swam'
    )

    class Meta:
        unique_together = ('event', 'heat_number')
        ordering = ['heat_number']

    def __str__(self):
        return f"Heat {self.heat_number} - {self.event}"


class HeatSwimmer(models.Model):
    """Lane assignments for each swimmer in a heat"""
    heat = models.ForeignKey(
        HeatList, on_delete=models.CASCADE,
        related_name='swimmers'
    )
    swimmer = models.ForeignKey(
        AppUser, on_delete=models.PROTECT
    )
    lane_number = models.IntegerField()
    seed_time = models.DurationField(null=True, blank=True)

    class Meta:
        unique_together = [
            ('heat', 'lane_number'),
            ('heat', 'swimmer')
        ]
        ordering = ['lane_number']

    def __str__(self):
        return f"{self.swimmer} - Lane {self.lane_number} - {self.heat}"


class HeatResult(models.Model):
    """Results recorded for each swimmer in a heat"""

    STATUS_CHOICES = [

        ('swam', 'Swam'),

        ('DNS', 'Did Not Start'),

        ('DQ', 'Disqualified'),

        ('DNF', 'Did Not Finish'),

        ('NP', 'Not Participating')

    ]

    heat = models.ForeignKey(
        HeatList, on_delete=models.CASCADE,
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

    class Meta:
        unique_together = ('heat', 'swimmer')

    def __str__(self):
        return f"{self.swimmer} - {self.status} - {self.finish_time}"