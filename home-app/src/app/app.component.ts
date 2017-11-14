import { Component, OnInit, OnDestroy } from '@angular/core';

import $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Aileron';
  public isScrolling: boolean;

  constructor() {
  	this.isScrolling = false;
  }

  updateIsScrolling(e) {
    if (e.target.scrollingElement) {
  	  this.isScrolling = e.target.scrollingElement.scrollTop > 100;
    }
  }

  ngOnInit() {
    $(window).on('scroll', this.updateIsScrolling.bind(this));
  	$(window).on('touchmove', this.updateIsScrolling.bind(this));
  }

  ngOnDestroy() {
    $(window).off('scroll', this.updateIsScrolling.bind(this));
  	$(window).off('touchmove', this.updateIsScrolling.bind(this));
  }

  public scrollTop() {
  	$('html, body').animate({ scrollTop: 0 }, 400);
  }
}
