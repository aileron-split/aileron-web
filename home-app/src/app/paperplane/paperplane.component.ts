import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AnimateService } from '../animate.service';
import $ from 'jquery';

import { Weathertank } from './weathertank/weathertank';

@Component({
    selector: 'app-paperplane',
    templateUrl: './paperplane.component.html',
    styleUrls: ['./paperplane.component.css']
})
export class PaperplaneComponent implements OnInit {
    private weathertank:Weathertank;

    constructor(private location: Location, private router: Router, private animate: AnimateService) {
        this.weathertank = new Weathertank();
    }

    ngOnInit() {
        this.animate.hideNav();
        let canvas = $('canvas#paperplane-canvas')[0];
        canvas.height = 0.5 * canvas.clientWidth;
        if (!this.weathertank.isLoaded)
            this.weathertank.load(canvas);
        this.weathertank.start();
    }

    goBack() {
        this.weathertank.pause();
        this.animate.restoreNav();
        this.location.back();
    }

}
