from django.contrib import admin
from .models import StateMaster
from .models import DistrictMaster
from .models import Association

@admin.register(StateMaster)
class StateMasterAdmin(admin.ModelAdmin):
    list_display = (
        "state_code",
        "state_name",
        "is_active",
        "created_at",
    )

    search_fields = (
        "state_code",
        "state_name",
    )

    list_filter = (
        "is_active",
    )

    ordering = (
        "state_name",
    )
@admin.register(DistrictMaster)
class DistrictMasterAdmin(admin.ModelAdmin):
    list_display = (
        "district_code",
        "district_name",
        "state",
        "is_active",
        "created_at",
    )

    search_fields = (
        "district_code",
        "district_name",
        "state__state_name",
    )

    list_filter = (
        "state",
        "is_active",
    )

    ordering = (
        "district_name",
    )
@admin.register(Association)
class AssociationAdmin(admin.ModelAdmin):

    list_display = (
        "association_code",
        "association_name",
        "association_type",
        "state",
        "district",
        "is_active",
        "created_at",
    )

    search_fields = (
        "association_code",
        "association_name",
        "state__state_name",
        "district__district_name",
    )

    list_filter = (
        "association_type",
        "state",
        "is_active",
    )

    ordering = (
        "association_name",
    )