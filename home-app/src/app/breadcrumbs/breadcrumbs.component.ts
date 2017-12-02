import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.css']
})
	export class BreadcrumbsComponent implements OnInit {
	@Input() upTarget: string;
	@Input() upTooltip: string;
	@Input() prevTarget: string;
	@Input() prevTooltip: string;
	@Input() nextTarget: string;
	@Input() nextTooltip: string;

  	constructor(
  		private location: Location,
    	private router: Router,
    	private route: ActivatedRoute,
	) { }

	ngOnInit() {
	}

	goUp() {
		if (this.upTarget)
			this.router.navigate(this.upTarget.split('|'));
	}
	
	goPrev() {
		if (this.prevTarget)
			this.router.navigate(this.prevTarget.split('|'));
	}
	
	goNext() {
		if (this.nextTarget)
			this.router.navigate(this.nextTarget.split('|'));
	}
}
