from django.http.response import JsonResponse
from rest_framework import viewsets

from django.shortcuts import render

from .models import Post
from .serializers import PostSerializer


# Blog app views.

class PostsViewSet (viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects

