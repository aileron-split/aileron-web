import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { Lightbox, IAlbum } from 'angular2-lightbox';

import { NewsService } from '../news.service';
import { NewsArticle } from '../news-article';


@Component({
	selector: 'app-news-article',
	templateUrl: './news-article.component.html',
	styleUrls: ['./news-article.component.css']
})
export class NewsArticleComponent implements OnInit {
    article: NewsArticle;

    panX: number = 0.0;

	constructor(
    	private route: ActivatedRoute,
    	private router: Router,
    	private newsService: NewsService,
    	private lightbox: Lightbox,
	) { }

	@HostListener('swipeleft', ['$event'])
	protected onSwipeLeft(event) {
		event.preventDefault();
		console.log('swipeleft -> next article');
	}

	@HostListener('swiperight', ['$event'])
	protected onSwipeRight(event) {
		event.preventDefault();
		console.log('swiperight -> previus article');
	}
/*
	@HostListener('panend')
	protected onPanEnd() {
		event.preventDefault();
		this.panX = 0.0;
	}

	@HostListener('panmove', ['$event'])
	protected onPanMove(event) {
		const PAN_SENSITIVITY: number = 1.0;
		const PAN_SCALE: number = 30.0;

		event.preventDefault();
		this.panX = PAN_SCALE * Math.atan(PAN_SENSITIVITY * event.deltaX * 0.01);
		// console.log('panmove', PAN_SCALE * Math.atan(PAN_SENSITIVITY * event.deltaX * 0.01));
	}
*/

	@HostListener('click', ['$event'])
	protected onClick(event) {
		if (event.target.tagName == 'IMG' && event.target.hasAttribute('index')) {
			this.openGallery(event.target.getAttribute('index'));
		}
	}

	ngOnInit() {
	    this.route.paramMap
	      .switchMap((params: ParamMap) => this.newsService.getNewsArticle(+params.get('id')))
	      .subscribe(article => this.article = article);
	}

	videoUrl(): string {
		return (this.article) ? this.article.video : null;
	}

	openGallery(index: number) {
		this.lightbox.open(this.article.albumList, index, { positionFromTop: 10 });
	}
}
