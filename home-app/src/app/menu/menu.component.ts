import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Link } from '../link';


export const MENU: Link[] = [
    { name: 'News', url: '/news' },
    { name: 'About Us', url: '/about' },
    // { name: 'Showcase', url: '/showcase'},
    { name: 'Dev Blog', url: '/blog' }
];


@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
    public menu = MENU;

    constructor(private router: Router) { }

    ngOnInit() {
    }
}
