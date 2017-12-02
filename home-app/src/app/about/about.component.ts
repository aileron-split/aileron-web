import { Component, OnInit } from '@angular/core';

import { AnimateService } from '../animate.service';

import { TeamMember } from '../team-member';
import { TeamService } from '../team.service';


@Component({
  	selector: 'app-about',
  	templateUrl: './about.component.html',
  	styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
	employees: TeamMember[];
	associates: TeamMember[];
	thanks: string[];

	thankyou: string;

  	constructor(
  		private animate: AnimateService,
  		private team: TeamService,
  	) { }

  	ngOnInit() {
		this.team.getEmployees().then(employees => this.employees = employees);
		this.team.getAssociates().then(associates => this.associates = associates);
		this.team.getThanks().then(thanks => this.thankyou = thanks.join(', '));
  	}

	avatarUrlString(member): string {
		if (member.avatar)
			return 'url(' + member.avatar + ')';
		return '';
	}

}
