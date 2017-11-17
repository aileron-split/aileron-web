import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NewsArticle } from '../news-article';


@Component({
  selector: 'app-news-article-preview',
  templateUrl: './news-article-preview.component.html',
  styleUrls: ['./news-article-preview.component.css']
})
export class NewsArticlePreviewComponent implements OnInit {
    @Input() article: NewsArticle;

    constructor(private router: Router) { }

    ngOnInit() {
    }

    openArticle() {
        this.router.navigate(['/news', this.article.id, this.article.slug]);
    }

}
