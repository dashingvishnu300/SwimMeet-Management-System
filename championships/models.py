from django.db import models
from users.models import AppUser
from meets.models import Meet
from events.models import EventDetail, EventList


class RecordType(models.Model):
    """District / State / National records"""
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Championship(models.Model):
    """Points and placement per swimmer per event"""
    swimmer = models.ForeignKey(
        AppUser, on_delete=models.PROTECT,
        related_name='championships'
    )
    event = models.ForeignKey(
        EventDetail, on_delete=models.PROTECT
    )
    meet = models.ForeignKey(
        Meet, on_delete=models.PROTECT
    )
    total_points = models.IntegerField(default=0)
    placement = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('swimmer', 'event', 'meet')

    def __str__(self):
        return f"{self.swimmer} - {self.event} - {self.total_points}pts"


class ChampionshipPoint(models.Model):
    """Cumulative points per swimmer per meet"""
    meet = models.ForeignKey(
        Meet, on_delete=models.PROTECT
    )
    swimmer = models.ForeignKey(
        AppUser, on_delete=models.PROTECT,
        related_name='championship_points'
    )
    points = models.IntegerField(default=0)

    class Meta:
        unique_together = ('meet', 'swimmer')

    def __str__(self):
        return f"{self.swimmer} - {self.meet} - {self.points}pts"


class Record(models.Model):
    """Records broken during meets"""
    swimmer = models.ForeignKey(
        AppUser, on_delete=models.PROTECT,
        related_name='records'
    )
    event_list = models.ForeignKey(
        EventList, on_delete=models.PROTECT
    )
    record_type = models.ForeignKey(
        RecordType, on_delete=models.PROTECT
    )
    old_time = models.DurationField(null=True, blank=True)
    new_time = models.DurationField()
    record_date = models.DateField(auto_now_add=True)
    meet = models.ForeignKey(
        Meet, on_delete=models.PROTECT,
        null=True, blank=True
    )

    def __str__(self):
        return f"{self.swimmer} - {self.event_list} - {self.new_time}"

class Qualification(models.Model):

    LEVEL_CHOICES = [

        ('DISTRICT', 'District'),

        ('STATE', 'State'),

        ('NATIONAL', 'National')

    ]

    swimmer = models.ForeignKey(

        AppUser,

        on_delete=models.CASCADE,

        related_name='qualifications'

    )

    meet = models.ForeignKey(

        Meet,

        on_delete=models.CASCADE

    )

    event = models.ForeignKey(

        EventDetail,

        on_delete=models.CASCADE

    )

    qualified_from = models.CharField(

        max_length=20,

        choices=LEVEL_CHOICES

    )

    qualified_to = models.CharField(

        max_length=20,

        choices=LEVEL_CHOICES

    )

    rank = models.PositiveIntegerField()

    qualification_time = models.DurationField()

    created_at = models.DateTimeField(

        auto_now_add=True

    )

    class Meta:

        unique_together = (

            'swimmer',

            'event',

            'qualified_to'

        )

    def __str__(self):

        return (

            f"{self.swimmer} → {self.qualified_to}"

        )