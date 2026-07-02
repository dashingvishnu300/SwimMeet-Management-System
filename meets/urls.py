from django.urls import path
from . import views

urlpatterns = [
    # Meet CRUD
    path('', views.meets, name='meets'),
    path('<int:meet_id>/', views.meet_detail, name='meet_detail'),

    # Meet lifecycle actions
    path('<int:meet_id>/action/<str:action>/', views.meet_action, name='meet_action'),

    # Meet documents
    path('<int:meet_id>/documents/', views.meet_documents, name='meet_documents'),
# Publish results
    path('<int:meet_id>/publish/',views.publish_results,name='publish_results'),

    path('<int:meet_id>/unpublish/',views.unpublish_results,name='unpublish_results'),
]