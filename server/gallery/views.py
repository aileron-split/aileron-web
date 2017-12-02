from rest_framework import viewsets

from .models import Album
from .serializers import AlbumSerializer


# Team app views.

# All team members
class AlbumsViewSet (viewsets.ReadOnlyModelViewSet):
    serializer_class = AlbumSerializer
    queryset = Album.objects

    def list(self, request, **kwargs):
        response = super(__class__, self).list(request, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response

