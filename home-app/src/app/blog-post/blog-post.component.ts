import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { BlogService } from '../blog.service';
import { BlogPost } from '../blog-post';


@Component({
	selector: 'app-blog-post',
	templateUrl: './blog-post.component.html',
	styleUrls: ['./blog-post.component.css']
})
export class BlogPostComponent implements OnInit {
	post: BlogPost;

	constructor(
    	private route: ActivatedRoute,
    	private blogService: BlogService
	) { }

	ngOnInit() {
	    this.route.paramMap
	      .switchMap((params: ParamMap) => this.blogService.getBlogPost(+params.get('id')))
	      .subscribe(post => this.post = post);
	}

}
