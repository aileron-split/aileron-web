# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-01 06:07
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('gallery', '0002_auto_20171129_0130'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='slug',
            field=models.SlugField(default='asd', max_length=80),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='image',
            name='album',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='images', to='gallery.Album'),
        ),
    ]
