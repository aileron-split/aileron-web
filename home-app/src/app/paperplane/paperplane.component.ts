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
    public canvasPrefs: any;


    constructor(private location: Location, private router: Router, private animate: AnimateService) {
        this.updateCanvasPrefs();
    }

    private updateCanvasPrefs() {
        let preferredCanvasWidth = $('div#bg-overlay').width();
        let preferredOffset = preferredCanvasWidth / 16;
        let preferredCanvasHeight = $('div#bg-overlay').height() /*- $('div.content').position().top*/ - preferredOffset;

        let minCanvasRatio = 2.0;
        if (preferredCanvasWidth / preferredCanvasHeight < minCanvasRatio) {
            preferredCanvasHeight = preferredCanvasWidth / minCanvasRatio;
        }

        this.canvasPrefs = {
            width: preferredCanvasWidth,
            height: preferredCanvasHeight,
            offset: preferredOffset
        };
    }

    launchPaperplane() {
        this.updateCanvasPrefs();
        let canvas = $('canvas#paperplane-canvas');

        // Align canvas to bottom
        canvas.css('top', (0.5 * $('div#bg-overlay').height() - this.canvasPrefs.height - this.canvasPrefs.offset) + 'px');
        canvas.css('width', this.canvasPrefs.width + 'px');
        canvas.css('height', this.canvasPrefs.height + 'px');

        let canvasPos = canvas.position();

        let bgImage = $('body > img#bg-image');
        let bgImagePos = bgImage.position();

        // setup target pointers
        let targetTop = $('div#target-top');
        let targetBottom = $('div#target-bottom');

        targetBottom.css('top', canvasPos.top + canvas.height());

        this.animate.blink([targetTop, targetBottom], 0.75, 0.7);



        if (this.weathertank) {
            this.weathertank.pause();
            delete this.weathertank;    
        }
        
        this.weathertank = new Weathertank();

        this.weathertank.load(canvas[0], {
            backgroundImageUrl: extractImageUrl($('body > img#bg-image').css('content')),
            backgroundTintColor: parseRgbColorArray($('div#bg-overlay').css('background-color')),
            backgroundTintOpacity: parseFloat($('div#bg-overlay').css('opacity')),
            backgroundBox: { top: bgImagePos.top, left: bgImagePos.left, width: bgImage.width(), height: bgImage.height() },
            canvasBox: { top: canvasPos.top, left: canvasPos.left, width: canvas.width(), height: canvas.height() },
            solverResolution: Math.pow(2.0, Math.round(Math.log2(canvas.width()/ 4.0))),
            targetPointer: { top: targetTop, bottom: targetBottom }
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
