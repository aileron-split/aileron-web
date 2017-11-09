from django.conf.urls import url, include
from rest_framework import routers

from .views import PostsViewSet


router = routers.SimpleRouter()
router.register('posts', PostsViewSet)


urlpatterns = [
    url(r'^', include(router.urls)),
]