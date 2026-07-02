from django.urls import path

from masters.views.state_views import state_list
from masters.views.district_views import district_list
from masters.views.association_views import (association_list,state_association_list)

urlpatterns = [

    path(
        'states/',
        state_list
    ),

    path(
        'states/<int:state_id>/districts/',
        district_list
    ),

    path(
        'districts/<int:district_id>/associations/',
        association_list
    ),
    path(
    'states/<int:state_id>/associations/',
    state_association_list
),

]