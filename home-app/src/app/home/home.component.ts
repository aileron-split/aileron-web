import { Component, OnInit } from '@angular/core';

import { Link } from '../link';


@Component({
  	selector: 'app-home',
  	templateUrl: './home.component.html',
  	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	public techs: Link[] = [
		{name: 'VR', icon:''},
		{name: 'Angular', icon:''},
		{name: 'Django', icon:''},
		{name: 'UnrealEngine4', icon:''},
		{name: 'Unity3D', icon:''},
		{name: '', icon:''},
	];

  	constructor() { }

  	ngOnInit() {
  	}

}
