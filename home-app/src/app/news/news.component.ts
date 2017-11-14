import { Component, HostListener, OnInit } from '@angular/core';

import { AnimateService } from '../animate.service';

import { NewsService } from '../news.service';
import { NewsArticle } from '../news-article';


@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {
  private columns: NewsArticle[][];
  private articles: NewsArticle[];

  constructor(private newsService: NewsService, private animate: AnimateService) { }

  ngOnInit() {
    this.newsService.getNewsArticles()
        .then(articles => this.articles = articles)
        .then(this.onResize.bind(this));
    this.onResize();
  }

  @HostListener('window:resize')
  onResize() {
    var width: number = window.innerWidth;

    if (this.articles) {
        if (width > 900) 
            this.columns = [
                this.articles.filter((v, i) => (i % 3) === 0),
                this.articles.filter((v, i) => (i % 3) === 1),
                this.articles.filter((v, i) => (i % 3) === 2)
            ];
        else if (width > 600)
            this.columns = [
                this.articles.filter((v, i) => (i % 2) === 0),
                this.articles.filter((v, i) => (i % 2) === 1)
            ];
        else
            this.columns = [this.articles];
    }
  }
}
