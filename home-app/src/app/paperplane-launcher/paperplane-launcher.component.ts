import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AnimateService } from '../animate.service';

@Component({
  selector: 'app-paperplane-launcher',
  templateUrl: './paperplane-launcher.component.html',
  styleUrls: ['./paperplane-launcher.component.css']
})
export class PaperplaneLauncherComponent implements OnInit {
	public isWebGLAvailable: boolean;
	public tooltip: string;


	constructor(private router: Router, private animate: AnimateService) {
		this.isWebGLAvailable = false;
	}

	ngOnInit() {
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

	launchPaperplane() {
		if (this.isWebGLAvailable) {
			
			this.router.navigate(['/paperplane']);
		}
	}

}
