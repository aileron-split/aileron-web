import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { environment } from '../environments/environment';

import 'rxjs/add/operator/toPromise';

import { NewsArticle } from './news-article';


@Injectable()
export class NewsService {
    private newsArticlesUrl = environment.apiUrl + 'news/articles/';
    private headers = new Headers({
        'Content-Type': 'application/json',
    });

    constructor(private http: Http) { }

    getNewsArticles(): Promise<NewsArticle[]> {
        return this.http.get(this.newsArticlesUrl)
            .toPromise()
            .then(response => response.json() as NewsArticle[])
            .catch(this.handleError);
    }

    getNewsArticle(id: number): Promise<NewsArticle> {
        return this.http.get(this.newsArticlesUrl + id + '/')
            .toPromise()
            .then(response => response.json() as NewsArticle)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
