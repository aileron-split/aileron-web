import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TweenLite } from 'gsap';
import $ from 'jquery';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
//    TweenLite.set($('#menu'), {y: -100});
//    TweenLite.to($('#menu'), 0.7, {y: 42});
  }
}
