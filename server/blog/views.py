from rest_framework import viewsets, mixins

from .models import Post
from .serializers import PostSerializer, PostDetailSerializer


# Blog app views.
class PostsViewSet (viewsets.ReadOnlyModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects

    def list(self, request):
        response = super(__class__, self).list(request)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedPostsViewSet (mixins.ListModelMixin,
                             viewsets.GenericViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects.filter(published=True).order_by('-published_date')

    def list(self, request):
        response = super(__class__, self).list(request)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedPostsDetailViewSet (mixins.RetrieveModelMixin,
                                   viewsets.GenericViewSet):
    serializer_class = PostDetailSerializer
    queryset = Post.objects.filter(published=True).order_by('-published_date')

    def retrieve(self, request, *args, **kwargs):
        response = super(__class__, self).retrieve(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response

