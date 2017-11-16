import { Injectable } from '@angular/core';

import { TimelineMax, Linear, Power2, Sine } from 'gsap';
import $ from 'jquery';


@Injectable()
export class AnimateService {

    constructor() { }

    // Paperplane icon take off animation
    paperplaneTakeOff(paperplaneIcon: any) {
        return new TimelineMax({ paused: true, clearProps: 'all' })
            .fromTo(paperplaneIcon, 2.0, 
                { opacity: 1.0, rotation: 0, left: 0 },
                { opacity: 0.0, rotation: 20, left: -150, ease: Power2.easeIn }, 0)
            .fromTo(paperplaneIcon, 2.0, 
                { top: 5 },
                { top: 150, ease: Linear.easeNone }, 0)
            ;
    }

    // Hide menu navigation and footer to show the weather tank canvas
    hideNav(): TimelineMax {
        let duration = 0.18;
        return new TimelineMax({ paused: true })
            .add('start', 0)
            .to([$('app-footer > div')], duration, { overflow: 'hidden', opacity: 0, ease:Linear.easeNone }, 'start')
            .to([$('#mainmenu div.menu-table')], duration, { 'margin-top': 10, 'margin-bottom': 5 }, 'start')
            .set([$('#mainmenu div.menu-buttons')], { 'display': 'none' }, 'start')
            .set([$('app-footer > div')], { 'display': 'none' }, duration)
            ;
    }

    // Blinking loop animation for weather tank target arrows
    blinkLoop(elem: any, period: number, opacity: number): TimelineMax {
        return new TimelineMax({ repeatDelay: 0, repeat: -1, yoyo: true, paused: true })
            .to(elem, period, { opacity: opacity, ease: Sine.easeInOut })
            ;
    }

    // Slow clockwise loop for paperplane icon marker arrows
    pendulumLoop(elem: any, period: number): TimelineMax {
        let left = '50deg';
        let right = '70deg';
        return new TimelineMax({ repeatDelay: 0, repeat: -1, yoyo: false, paused: true })
            .fromTo(elem, period, { rotation: left}, { rotation: right, ease: Sine.easeInOut })
            .fromTo(elem, period, { rotation: right}, { rotation: left, ease: Sine.easeInOut })
            ;
    }

    // Pulsating for paperplane icon marker arrows while hovering
    pulsateLoop(arrowL: any, arrowR: any, period: number, fromOffset: number, toOffset: number, ease?: any): TimelineMax {
        return new TimelineMax({ repeatDelay: 0, repeat: -1, yoyo: false, paused: true })
            .add('midpoint', period)
            .fromTo(arrowL, period, { left: fromOffset }, { left: toOffset, ease: (ease) ? ease : Sine.easeInOut }, 0)
            .fromTo(arrowR, period, { right: fromOffset }, { right: toOffset, ease: (ease) ? ease : Sine.easeInOut }, 0)
            .fromTo(arrowL, period, { left: toOffset }, { left: fromOffset, ease: (ease) ? ease : Sine.easeInOut }, 'midpoint')
            .fromTo(arrowR, period, { right: toOffset }, { right: fromOffset, ease: (ease) ? ease : Sine.easeInOut }, 'midpoint')
            ;
    }

}
