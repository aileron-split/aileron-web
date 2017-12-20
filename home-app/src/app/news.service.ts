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

    private articlesCache: NewsArticle[];

    constructor(private http: Http) { }

    getNewsArticles(): Promise<NewsArticle[]> {
        const theService = this;
        return this.http.get(this.newsArticlesUrl)
            .toPromise()
            .then(function(response): NewsArticle[] {
                theService.articlesCache = response.json() as NewsArticle[];
                return theService.articlesCache;
            })
            .catch(this.handleError);
    }

    getNewsArticle(id: number): Promise<NewsArticle> {
        const articlesCache = this.articlesCache;
        return this.http.get(this.newsArticlesUrl + id + '/')
            .toPromise()
            .then(function(response): NewsArticle {
                const article: NewsArticle = response.json() as NewsArticle;

                // Process article's album and add list and dictionary forms
                article.albumList = [];
                article.albumDict = [];
                if (article.album) {
                    for (const image of article.album.images) {
                        article.albumDict[image.slug] = {
                            index: article.albumList.length,
                            src: image.image,
                            caption: image.summary,
                        };
                        article.albumList.push({
                            src: image.image,
                            caption: image.summary,
                            // thumb: ''
                        });
                    }
                }
                // Derive previous and next article from articlesCache
                if (articlesCache) {
                    const cacheIndex = articlesCache.findIndex(a => a.id === id);
                    if (cacheIndex !== -1) {
                        if (cacheIndex > 0) {
                            const prevArticle = articlesCache[cacheIndex - 1];
                            article.prevTarget = prevArticle.id + '|' + prevArticle.slug;
                            article.prevCaption = prevArticle.title;
                        }
                        if (cacheIndex < articlesCache.length - 1) {
                            const nextArticle = articlesCache[cacheIndex + 1];
                            article.nextTarget = nextArticle.id + '|' + nextArticle.slug;
                            article.nextCaption = nextArticle.title;
                        }
                    }
                }
                return article;
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
