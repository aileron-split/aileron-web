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

	constructor(private http: Http) { }

    getBlogPosts(): Promise<BlogPost[]> {
        return this.http.get(this.blogPostsUrl)
            .toPromise()
            .then(response => response.json() as BlogPost[])
            .catch(this.handleError);
    }

    getBlogPost(id: number): Promise<BlogPost> {
        return this.http.get(this.blogPostsUrl + id + '/')
            .toPromise()
            .then(response => response.json() as BlogPost)
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occured', error);
        return Promise.reject(error.message || error);
    }
}
