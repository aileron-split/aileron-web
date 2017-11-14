import { Component, OnInit } from '@angular/core';

import { Link } from '../link';


@Component({
  	selector: 'app-home',
  	templateUrl: './home.component.html',
  	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	public techs: Link[] = [
		/* techs */
		{ name: 'Unreal Engine 4', icon: '/images/techs/unreal.png', tooltip: 'Unreal Engine 4', iconScale: 1.5 },
		{ name: 'HTC VIVE', icon: '/images/techs/ViveVerticalLogo.png', tooltip: 'HTC VIVE' },
		{ name: 'Django', icon: '/images/techs/django-logo-negative.png', tooltip: 'Django' },
		{ name: 'Angular 2', icon: '/images/techs/angular_whiteTransparent.png', tooltip: 'Angular 2' },
		{ name: 'GreenSock GSAP', icon: '/images/techs/greensock-gsap-logo.png', tooltip: 'GreenSock GSAP' },
		{ name: 'Unity 3D', icon: '/images/techs/unity-logowhite_large.png', tooltip: 'Unity 3D' },
	];
		
	public tools: Link[] = [
		/* tools */
		{ name: 'QGIS', icon: '/images/techs/qgis-icon-white128.png', tooltip: 'QGIS', iconScale: 0.8 },
		{ name: 'OpenFOAM', icon: '/images/techs/openfoam-logo.png', tooltip: 'OpenFOAM', iconScale: 1.3 },
		{ name: 'Blender', icon: '/images/techs/blender.png', tooltip: 'Blender', iconScale: 0.8 },
		{ name: 'Gimp', icon: '/images/techs/Gimp-icon.png', tooltip: 'Gimp' },
		{ name: 'Inkscape', icon: '/images/techs/Inkscape.png', tooltip: 'Inkscape' },
		{ name: 'Ubuntu', icon: '/images/techs/ubuntu.png', tooltip: 'Ubuntu' },
	];

	public oses: Link[] = [
		/* oses */
		{ name: 'Linux', icon: '/images/techs/linux.png', tooltip: 'Linux' },
		{ name: 'Windows', icon: '/images/techs/windows_logo.png', tooltip: 'Windows' },
		{ name: 'Android', icon: '/images/techs/android-logo-white.png', tooltip: 'Android' },
	];

	public languages: Link[] = [
		/* languages */
		{ name: 'C++', icon: '/images/techs/Cpp.png', tooltip: 'C++' },
		{ name: 'Python', icon: '/images/techs/python.png', tooltip: 'Python', iconScale: 0.9 },
		{ name: 'TypeScript', icon: '/images/techs/typescript.png', tooltip: 'TypeScript', iconScale: 1.6 },
		{ name: 'C#', icon: '/images/techs/c-sharp.png', tooltip: 'C#', iconScale: 0.9 },
	];

  	constructor() { }

  	ngOnInit() {
  	}

}
