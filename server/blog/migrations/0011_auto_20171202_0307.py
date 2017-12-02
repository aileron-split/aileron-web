# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-02 03:07
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0010_post_album'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='content',
            field=models.TextField(default='Post content.'),
        ),
        migrations.AlterField(
            model_name='post',
            name='summary',
            field=models.TextField(default='Post summary.'),
        ),
        migrations.AlterField(
            model_name='post',
            name='title',
            field=models.CharField(default='Post Title', max_length=80),
        ),
    ]