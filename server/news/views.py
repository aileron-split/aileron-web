from rest_framework import viewsets, mixins

from .models import Article
from .serializers import ArticleSerializer, ArticleDetailSerializer


# News app views.
class ArticlesViewSet (viewsets.ReadOnlyModelViewSet):
    serializer_class = ArticleSerializer
    queryset = Article.objects

    def list(self, request):
        response = super(__class__, self).list(request)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedArticlesViewSet (mixins.ListModelMixin,
                                viewsets.GenericViewSet):
    serializer_class = ArticleSerializer
    queryset = Article.objects.filter(published=True).order_by('-published_date')

    def list(self, request):
        response = super(__class__, self).list(request)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedArticlesDetailViewSet (mixins.RetrieveModelMixin,
                                      viewsets.GenericViewSet):
    serializer_class = ArticleDetailSerializer
    queryset = Article.objects.filter(published=True).order_by('-published_date')

    def retrieve(self, request, *args, **kwargs):
        response = super(__class__, self).retrieve(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response
