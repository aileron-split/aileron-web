import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { NewsArticle } from './news-article';


@Injectable()
export class NewsService {
    private newsArticlesUrl = 'http://192.168.18.107:4242/api/news/articles/';
    private headers = new Headers({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://192.168.18.107:4242'
    });

    constructor(private http: Http) { }

    getNewsArticles(): Promise<NewsArticle[]> {
        return this.http.get(this.newsArticlesUrl)
            .toPromise()
            .then(response => response.json() as NewsArticle[])
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
