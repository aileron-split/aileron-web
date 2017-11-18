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
	private employees: TeamMember[];
	private associates: TeamMember[];

  	constructor(
  		private animate: AnimateService,
  		private team: TeamService,
  	) { }

  	ngOnInit() {
		this.team.getEmployees().then(employees => this.employees = employees);
		this.team.getAssociates().then(associates => this.associates = associates);
  	}

	avatarUrlString(member): string {
		if (member.avatar)
			return 'url(' + member.avatar + ')';
		return '';
	}

}
