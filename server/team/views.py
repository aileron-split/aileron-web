from rest_framework import viewsets, mixins

from .models import Member
from .serializers import MemberSerializer, MemberDetailSerializer


# Team app views.

# All team members
class MembersViewSet (viewsets.ReadOnlyModelViewSet):
    serializer_class = MemberSerializer
    queryset = Member.objects

    def list(self, request, **kwargs):
        response = super(__class__, self).list(request, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedMembersViewSet (mixins.ListModelMixin,
                               viewsets.GenericViewSet):
    serializer_class = MemberSerializer
    queryset = Member.objects.filter(published=True).order_by('-published_date')

    def list(self, request, **kwargs):
        response = super(__class__, self).list(request, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedMembersDetailViewSet (mixins.RetrieveModelMixin,
                                     viewsets.GenericViewSet):
    serializer_class = MemberDetailSerializer
    queryset = Member.objects.filter(published=True).order_by('-published_date')

    def retrieve(self, request, *args, **kwargs):
        response = super(__class__, self).retrieve(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


# Employees only
class EmployeesViewSet (viewsets.ReadOnlyModelViewSet):
    serializer_class = MemberSerializer
    queryset = Member.objects.filter(status__in=(Member.FULLTIME, Member.PARTTIME))

    def list(self, request, **kwargs):
        response = super(__class__, self).list(request, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedEmployeesViewSet (mixins.ListModelMixin,
                                 viewsets.GenericViewSet):
    serializer_class = MemberSerializer
    queryset = Member.objects.filter(published=True, status__in=(Member.FULLTIME, Member.PARTTIME)).order_by('published_date')

    def list(self, request, **kwargs):
        response = super(__class__, self).list(request, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedEmployeesDetailViewSet (mixins.RetrieveModelMixin,
                                       viewsets.GenericViewSet):
    serializer_class = MemberDetailSerializer
    queryset = Member.objects.filter(published=True, status__in=(Member.FULLTIME, Member.PARTTIME)).order_by('published_date')

    def retrieve(self, request, *args, **kwargs):
        response = super(__class__, self).retrieve(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


# Associates only
class AssociatesViewSet (viewsets.ReadOnlyModelViewSet):
    serializer_class = MemberSerializer
    queryset = Member.objects.filter(status=Member.ASSOCIATE)

    def list(self, request, **kwargs):
        response = super(__class__, self).list(request, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedAssociatesViewSet (mixins.ListModelMixin,
                                  viewsets.GenericViewSet):
    serializer_class = MemberSerializer
    queryset = Member.objects.filter(published=True, status=Member.ASSOCIATE).order_by('-last_name')

    def list(self, request, **kwargs):
        response = super(__class__, self).list(request, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response


class PublishedAssociatesDetailViewSet (mixins.RetrieveModelMixin,
                                        viewsets.GenericViewSet):
    serializer_class = MemberDetailSerializer
    queryset = Member.objects.filter(published=True, status=Member.ASSOCIATE).order_by('-last_name')

    def retrieve(self, request, *args, **kwargs):
        response = super(__class__, self).retrieve(request, *args, **kwargs)
        response['Access-Control-Allow-Origin'] = 'http://192.168.18.107:4200'  # TODO: REMOVE, TESTING ONLY
        return response
