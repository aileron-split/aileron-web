import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { BlogPost } from '../blog-post';

@Component({
    selector: 'app-blog-post-preview',
    templateUrl: './blog-post-preview.component.html',
    styleUrls: ['./blog-post-preview.component.css']
})
export class BlogPostPreviewComponent implements OnInit {
    @Input() post: BlogPost;

    constructor(private router: Router) { }

    ngOnInit() {
    }

    openPost() {
        this.router.navigate(['/blog', this.post.id, this.post.slug]);
    }
}
