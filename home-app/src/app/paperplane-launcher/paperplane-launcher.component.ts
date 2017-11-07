import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AnimateService } from '../animate.service';

@Component({
  selector: 'app-paperplane-launcher',
  templateUrl: './paperplane-launcher.component.html',
  styleUrls: ['./paperplane-launcher.component.css']
})
export class PaperplaneLauncherComponent implements OnInit {

  constructor(private router: Router, private animate: AnimateService) { }

  ngOnInit() {
  }

  launchPaperplane() {
    this.animate.hideNav();
    this.router.navigate(['/paperplane']);
  }

}
