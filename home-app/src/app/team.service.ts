import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { TeamMember } from './team-member';


@Injectable()
export class TeamService {
    private teamEmployeesUrl = 'http://192.168.18.107:4242/api/team/employees/';
    private teamAssociatesUrl = 'http://192.168.18.107:4242/api/team/associates/';

	constructor(private http: Http) { }

    getEmployees(): Promise<TeamMember[]> {
        return this.http.get(this.teamEmployeesUrl)
            .toPromise()
            .then(response => response.json() as TeamMember[])
            .catch(this.handleError);
    }

    getAssociates(): Promise<TeamMember[]> {
        return this.http.get(this.teamAssociatesUrl)
            .toPromise()
            .then(response => response.json() as TeamMember[])
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
