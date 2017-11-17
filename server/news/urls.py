from django.conf.urls import url, include
from rest_framework import routers

from .views import PublishedArticlesViewSet, PublishedArticlesDetailViewSet


router = routers.SimpleRouter()
router.register('articles', PublishedArticlesViewSet)
router.register('articles', PublishedArticlesDetailViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
]