import { Component, OnInit } from '@angular/core';

import { Link } from '../link';
import { MENU } from '../menu/menu.component';


export const SOCIAL: Link[] = [
    { name: 'Facebook', url: 'https://www.facebook.com/AileronSplit/' },
    { name: 'YouTube', url: 'https://www.youtube.com/channel/UCxNj4Yti0U8HTBFNWgFDs3Q' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/aileron-d-o-o-/' }
];


@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
    public social = SOCIAL;
    public menu = MENU;

    constructor() { }

    ngOnInit() {
    }

}
