import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import { environment } from '../environments/environment';

import 'rxjs/add/operator/toPromise';

import { BlogPost } from './blog-post';


@Injectable()
export class BlogService {
    private blogPostsUrl = environment.apiUrl + 'blog/posts/';
    private headers = new Headers({
        'Content-Type': 'application/json',
    });

    private postsCache: BlogPost[];

    constructor(private http: Http) { }

    getBlogPosts(): Promise<BlogPost[]> {
        const theService = this;
        return this.http.get(this.blogPostsUrl)
            .toPromise()
            .then(function(response): BlogPost[] {
                theService.postsCache = response.json() as BlogPost[];
                return theService.postsCache;
            })
            .catch(this.handleError);
    }

    getBlogPost(id: number): Promise<BlogPost> {
        const postsCache = this.postsCache;
        return this.http.get(this.blogPostsUrl + id + '/')
            .toPromise()
            .then(function(response): BlogPost {
                const post: BlogPost = response.json() as BlogPost;

                // Process post's album and add list and dictionary forms
                post.albumList = [];
                post.albumDict = [];
                if (post.album) {
                    for (const image of post.album.images) {
                        post.albumDict[image.slug] = {
                            index: post.albumList.length,
                            src: image.image,
                            caption: image.summary,
                        };
                        post.albumList.push({
                            src: image.image,
                            caption: image.summary,
                            // thumb: ''
                        });
                    }
                }

                // Derive previous and next post from postsCache
                if (postsCache) {
                    const cacheIndex = postsCache.findIndex(a => a.id === id);
                    if (cacheIndex !== -1) {
                        if (cacheIndex > 0) {
                            const prevArticle = postsCache[cacheIndex - 1];
                            post.prevTarget = prevArticle.id + '|' + prevArticle.slug;
                            post.prevCaption = prevArticle.title;
                        }
                        if (cacheIndex < postsCache.length - 1) {
                            const nextArticle = postsCache[cacheIndex + 1];
                            post.nextTarget = nextArticle.id + '|' + nextArticle.slug;
                            post.nextCaption = nextArticle.title;
                        }
                    }
                }
                return post;
            })
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
