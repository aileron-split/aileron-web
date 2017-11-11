import { Component, OnInit } from '@angular/core';

import { AnimateService } from '../animate.service';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  constructor(private animate: AnimateService) { }

  ngOnInit() {
  }

}
