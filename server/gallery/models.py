from django.db import models

from server import settings


class Image(models.Model):
    album = models.ForeignKey('Album', on_delete=models.PROTECT, related_name='images')

    slug = models.SlugField(max_length=80)
    title = models.CharField(max_length=80, default='Image title')
    summary = models.TextField(default='Image caption.')
    image = models.ImageField(upload_to='images/gallery/')

    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def image_tag(self):
        return u'<img width="120px" src="%s">' % (settings.MEDIA_URL + self.image.name)
    image_tag.short_description = ''
    image_tag.allow_tags = True


class Album(models.Model):
    title = models.CharField(max_length=80, default='Test Album')
    summary = models.TextField(default='Test summary.')

    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
