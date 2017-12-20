import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { environment } from '../environments/environment';

import 'rxjs/add/operator/toPromise';

import { TeamMember } from './team-member';


const THANKS: string[] = [
    'Anđelka Bokun',
    'Josip Bokun',
    'Željko Draščić',
    'Diana and Jagoda from accounting office',
    'Miroslav Mrva',
    'Nada Gugić',
    'Marijana Anić',
    'Sandi from Karlovac',
    'OpenCoffee Split',
];


@Injectable()
export class TeamService {
    private teamEmployeesUrl = environment.apiUrl + 'team/employees/';
    private teamAssociatesUrl = environment.apiUrl + 'team/associates/';

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

    getThanks(): Promise<string[]> {
        return new Promise<string[]>(resolve => {
            resolve(THANKS);
        });
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
