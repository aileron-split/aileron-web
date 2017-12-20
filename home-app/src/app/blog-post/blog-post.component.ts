import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { Lightbox, IAlbum } from 'angular2-lightbox';

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
        private router: Router,
        private blogService: BlogService,
        private lightbox: Lightbox,
    ) { }

    @HostListener('click', ['$event'])
    protected onClick(event) {
        if (event.target.tagName === 'IMG' && event.target.hasAttribute('index')) {
            this.openGallery(event.target.getAttribute('index'));
        }
    }

    ngOnInit() {
        this.route.paramMap
          .switchMap((params: ParamMap) => this.blogService.getBlogPost(+params.get('id')))
          .subscribe(post => this.post = post);
    }

    videoUrl(): string {
        return (this.post) ? this.post.video : null;
    }

    openGallery(index: number) {
        this.lightbox.open(this.post.albumList, index, { positionFromTop: 10, wrapAround: true });
    }

}
