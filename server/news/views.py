from django.http.response import JsonResponse
from rest_framework import viewsets

from django.shortcuts import render

from .models import Article
from .serializers import ArticleSerializer


# News app views.

class ArticlesViewSet (viewsets.ModelViewSet):
    serializer_class = ArticleSerializer
    queryset = Article.objects

