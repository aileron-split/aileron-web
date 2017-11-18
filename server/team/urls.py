from django.conf.urls import url, include
from rest_framework import routers

from .views import PublishedMembersViewSet, PublishedMembersDetailViewSet
from .views import PublishedEmployeesViewSet, PublishedEmployeesDetailViewSet
from .views import PublishedAssociatesViewSet, PublishedAssociatesDetailViewSet


router = routers.SimpleRouter()
router.register('members', PublishedMembersViewSet)
router.register('members', PublishedMembersDetailViewSet)
router.register('employees', PublishedEmployeesViewSet)
router.register('employees', PublishedEmployeesDetailViewSet)
router.register('associates', PublishedAssociatesViewSet)
router.register('associates', PublishedAssociatesDetailViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
]