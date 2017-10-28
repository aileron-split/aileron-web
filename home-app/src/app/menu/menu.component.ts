import { Component, OnInit } from '@angular/core';
import { TweenLite } from 'gsap';
import $ from 'jquery';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    TweenLite.set($('#menu'), {y: -100});
    TweenLite.to($('#menu'), 0.7, {y: 42});
  }

}
