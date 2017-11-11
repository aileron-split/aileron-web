import { Injectable } from '@angular/core';

import { TweenLite, Linear } from 'gsap';
import $ from 'jquery';

@Injectable()
export class AnimateService {
    private navTweens: TweenLite; 


    constructor() { }

    restoreNav() {
        if (this.navTweens) 
            this.navTweens.reverse();
    }

    hideNav(callback: any) {
        if (this.navTweens) 
            this.navTweens.play();
        else
            this.navTweens = TweenLite.to([$('#mainmenu'), $('app-footer div')], .18, {height: 0, overflow: 'hidden', opacity: 0, ease:Linear.easeNone, onComplete: callback});
    }

}
