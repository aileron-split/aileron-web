from django.conf.urls import url, include
from rest_framework import routers

from .views import ArticlesViewSet


router = routers.SimpleRouter()
router.register('articles', ArticlesViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
]