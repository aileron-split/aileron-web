# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-11-28 21:17
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0010_auto_20171128_2045'),
    ]

    operations = [
        migrations.AlterField(
            model_name='article',
            name='author',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='team.Member'),
        ),
    ]
