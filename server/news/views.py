from django.http.response import JsonResponse
from rest_framework import viewsets

from django.shortcuts import render

from .models import Article
from .serializers import ArticleSerializer


# News app views.

class ArticlesViewSet (viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    queryset = Article.objects

    def list(self, request):
        response = super(__class__, self).list(request)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200' # TODO: REMOVE, TESTING ONLY
        return response
