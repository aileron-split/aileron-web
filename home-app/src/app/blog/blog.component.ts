import { Component, OnInit } from '@angular/core';

import { AnimateService } from '../animate.service';

import { BlogService } from '../blog.service';
import { BlogPost } from '../blog-post';


@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  posts: BlogPost[];

  constructor(private blogService: BlogService, private animate: AnimateService) { }

  ngOnInit() {
    this.blogService.getBlogPosts()
      .then(posts => this.posts = posts);
  }

}
