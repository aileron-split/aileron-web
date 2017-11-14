import { Injectable } from '@angular/core';

import { TweenLite, TimelineMax, Linear, Sine } from 'gsap';
import $ from 'jquery';


@Injectable()
export class AnimateService {
    private navTweens: TweenLite[]; 


    constructor() {
        this.navTweens = [];
    }

    restoreNav() {
        if (this.navTweens) 
            this.navTweens.forEach(t => t.reverse());
    }

    hideNav(onComplete: any) {
        if (this.navTweens.length > 0) 
            this.navTweens.forEach(t => t.play());
        else {
            this.navTweens.push(TweenLite.to([$('app-footer > div')], .18, { height: 0, overflow: 'hidden', opacity: 0, ease:Linear.easeNone, onComplete: onComplete }));
            this.navTweens.push(TweenLite.to([$('#mainmenu div.menu-table')], .18, { 'margin-top': 10, 'margin-bottom': 5 }));
            this.navTweens.push(TweenLite.set([$('#mainmenu div.menu-buttons')], { 'display': 'none' }));
        }
    }


    blink(elem: any, duration: number, alpha: number) {
        var tl = new TimelineMax();

        tl.to(elem, duration, {alpha: alpha, repeatDelay: 0, repeat: -1, yoyo: true, ease: Sine.easeInOut})
        tl.play();
    }
}
