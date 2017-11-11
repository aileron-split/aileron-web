import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AnimateService } from '../animate.service';
import $ from 'jquery';

import { Weathertank } from './weathertank/weathertank';

function extractImageUrl(imageUrl: string): string {
    return imageUrl.slice(4, -1).replace(/['"]/g,'');
}

function parseRgbColorArray(rgbColor: string): number[] {
    return rgbColor.slice(4, -1).replace(/ /g, '').split(',').map(parseFloat);
}


@Component({
    selector: 'app-paperplane',
    templateUrl: './paperplane.component.html',
    styleUrls: ['./paperplane.component.css']
})
export class PaperplaneComponent implements OnInit {
    private weathertank: Weathertank;

    constructor(private location: Location, private router: Router, private animate: AnimateService) {
    }

    launchPaperplane() {
        let canvas = $('canvas#paperplane-canvas');
        let canvasPos = canvas.position();

        let bgImage = $('body > img#bg-image');
        let bgImagePos = bgImage.position();

        if (this.weathertank) {
            this.weathertank.pause();
            delete this.weathertank;    
        }
        
        this.weathertank = new Weathertank();

        this.weathertank.load(canvas[0], {
            backgroundImageUrl: extractImageUrl($('body > img#bg-image').css('content')),
            backgroundTintColor: parseRgbColorArray($('body div#bg-overlay').css('background-color')),
            backgroundTintOpacity: parseFloat($('body div#bg-overlay').css('opacity')),
            backgroundBox: { top: bgImagePos.top, left: bgImagePos.left, width: bgImage.width(), height: bgImage.height() },
            canvasBox: { top: canvasPos.top, left: canvasPos.left, width: canvas.width(), height: canvas.height() }
        });
    }

    ngOnInit() {
        this.animate.hideNav(this.launchPaperplane.bind(this));
    }

    ngOnDestroy() {
        this.animate.restoreNav();
    }

    goBack() {
        this.location.back();
    }

}
