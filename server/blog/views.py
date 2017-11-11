from django.http.response import JsonResponse
from rest_framework import viewsets

from django.shortcuts import render

from .models import Post
from .serializers import PostSerializer


# Blog app views.

class PostsViewSet (viewsets.ModelViewSet):
    serializer_class = PostSerializer
    queryset = Post.objects

    def list(self, request):
        response = super(__class__, self).list(request)
        response['TEST'] = str(dir(request))
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200' # TODO: REMOVE, TESTING ONLY
        return response
