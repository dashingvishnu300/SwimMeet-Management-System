from django.db import models
from meets.models import Meet, GenderCategory, AgeGroup


class EventList(models.Model):
    """Master list of all possible swimming events"""
    distance_m = models.IntegerField()
    stroke = models.CharField(max_length=50)
    gender = models.ForeignKey(GenderCategory, on_delete=models.PROTECT)
    age_group = models.ForeignKey(AgeGroup, on_delete=models.PROTECT)
    is_relay = models.BooleanField(default=False)
    is_marathon = models.BooleanField(default=False)

    is_sub_junior = models.BooleanField(
        default=True
    )

    is_junior = models.BooleanField(
        default=True
    )

    is_senior = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"{self.distance_m}m {self.stroke} - {self.age_group}"


class EventDetail(models.Model):
    """Events assigned to a specific meet"""
    meet = models.ForeignKey(
        Meet, on_delete=models.CASCADE,
        related_name='events'
    )
    event_list = models.ForeignKey(
        EventList, on_delete=models.PROTECT
    )
    name = models.CharField(max_length=200)

    def save(self, *args, **kwargs):
        # Auto generate name from distance + stroke
        self.name = f"{self.event_list.distance_m}m {self.event_list.stroke}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.meet.name} - {self.name}"