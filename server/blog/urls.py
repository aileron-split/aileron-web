from django.conf.urls import url, include
from rest_framework import routers

from .views import PublishedPostsViewSet, PublishedPostsDetailViewSet


router = routers.SimpleRouter()
router.register('posts', PublishedPostsViewSet)
router.register('posts', PublishedPostsDetailViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
]