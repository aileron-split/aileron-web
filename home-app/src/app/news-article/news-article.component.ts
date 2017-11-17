import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { NewsService } from '../news.service';
import { NewsArticle } from '../news-article';


@Component({
	selector: 'app-news-article',
	templateUrl: './news-article.component.html',
	styleUrls: ['./news-article.component.css']
})
export class NewsArticleComponent implements OnInit {
    article: NewsArticle;

	constructor(
    	private route: ActivatedRoute,
    	private newsService: NewsService
	) { }

	ngOnInit() {
	    this.route.paramMap
	      .switchMap((params: ParamMap) => this.newsService.getNewsArticle(+params.get('id')))
	      .subscribe(article => this.article = article);
	}

}
