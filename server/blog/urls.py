from django.conf.urls import url, include
from rest_framework import routers

from .views import PublishedPostsViewSet


router = routers.SimpleRouter()
router.register('posts', PublishedPostsViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
]