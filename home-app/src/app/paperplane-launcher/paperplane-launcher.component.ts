import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AnimateService } from '../animate.service';

import { Sine } from 'gsap';
import $ from 'jquery';

@Component({
  selector: 'app-paperplane-launcher',
  templateUrl: './paperplane-launcher.component.html',
  styleUrls: ['./paperplane-launcher.component.css']
})
export class PaperplaneLauncherComponent implements OnInit {
	public isWebGLAvailable: boolean;
	public isHovering: boolean;

	public tooltip: string;

	// animations
	private hoveringTimeline: any;
	private rotatingMarkersTimeline: any;

	constructor(private router: Router, private animate: AnimateService) {
		this.isWebGLAvailable = false;
	}


	// Check for WebGL an set tooltips accordingly
	private checkWebGL() {
		let canvas = document.createElement('canvas');
		let gl: any = canvas.getContext('webgl2', { premultipliedAlpha: false });

		this.tooltip = ''
		this.isWebGLAvailable = false;
		if (gl) {
	        if (gl.getExtension('EXT_color_buffer_float')) {
				this.isWebGLAvailable = true;
	        } else {
				this.tooltip = 'Floating point color buffer is not available'
	        }
		} else {
			this.tooltip = 'WebGL 2 is not supported by your device';
		}
	}

	ngOnInit() {
		this.checkWebGL();

		if (!this.hoveringTimeline) this.hoveringTimeline = this.animate.pulsateLoop($('div.arrows-marker div#marker-left'), $('div.arrows-marker div#marker-right'), 0.4, -20, -27, Sine.easeInOut);
		if (!this.rotatingMarkersTimeline) this.rotatingMarkersTimeline = this.animate.pendulumLoop($('div.arrows-marker'), 0.6);

		this.rotatingMarkersTimeline.play();
	}


	/* EVENT HANDLERS */

	onClick() {
		if (!this.isWebGLAvailable) return;
		this.router.navigate(['/paperplane']);
	}

	onMouseOver() {
		if (!this.isWebGLAvailable) return;
		if (!this.isHovering) {
			this.isHovering = true;
			this.hoveringTimeline.resume();
/*				.repeat(-1)
				.eventCallback('onComplete', null)
				;
*/			this.rotatingMarkersTimeline.pause();
/*				.repeat(0)
				.eventCallback('onComplete', this.hoveringTimeline.restart.bind(this.hoveringTimeline))
				;
*/		}
	}

	onMouseOut() {
		if (!this.isWebGLAvailable) return;
		if (this.isHovering) {
			this.isHovering = false;
			this.rotatingMarkersTimeline.resume();
//				.repeat(-1)
//				.eventCallback('onComplete', null)
//				;
			this.hoveringTimeline.pause();
//				.repeat(0)
//				.eventCallback('onComplete', this.rotatingMarkersTimeline.restart.bind(this.rotatingMarkersTimeline))
//				;
/*			if(!this.rotatingMarkersTimeline.isActive())
				this.rotatingMarkersTimeline.play();
*/		}
	}

}
