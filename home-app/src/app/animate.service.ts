import { Injectable } from '@angular/core';

import { TweenLite, Linear } from 'gsap';
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

    hideNav(callback: any) {
        if (this.navTweens.length > 0) 
            this.navTweens.forEach(t => t.play());
        else {
            this.navTweens.push(TweenLite.to([$('app-footer > div')], .18, { height: 0, overflow: 'hidden', opacity: 0, ease:Linear.easeNone, onComplete: callback }));
            this.navTweens.push(TweenLite.to([$('#mainmenu div.menu-table')], .18, { 'margin-top': 10, 'margin-bottom': 5 }));
            this.navTweens.push(TweenLite.set([$('#mainmenu div.menu-buttons')], { 'display': 'none' }));
        }
    }

}
