from django.conf.urls import url, include
from rest_framework import routers

from .views import PublishedArticlesViewSet


router = routers.SimpleRouter()
router.register('articles', PublishedArticlesViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
]