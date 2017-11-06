import { Component, Input, OnInit } from '@angular/core';

import { DevblogArticle } from '../devblog-article';

@Component({
  selector: 'app-devblog-article-preview',
  templateUrl: './devblog-article-preview.component.html',
  styleUrls: ['./devblog-article-preview.component.css']
})
export class DevblogArticlePreviewComponent implements OnInit {
  @Input() article: DevblogArticle;

  constructor() { }

  ngOnInit() {
  }

}
