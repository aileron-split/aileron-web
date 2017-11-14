import { Component, Input, OnInit } from '@angular/core';

import { BlogPost } from '../blog-post';

@Component({
  selector: 'app-blog-post-preview',
  templateUrl: './blog-post-preview.component.html',
  styleUrls: ['./blog-post-preview.component.css']
})
export class BlogPostPreviewComponent implements OnInit {
  @Input() post: BlogPost;

  constructor() { }

  ngOnInit() {
  }

}
