import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { NewsComponent } from './news/news.component';
import { NewsArticleComponent } from './news-article/news-article.component';
import { AboutComponent } from './about/about.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { ContactComponent } from './contact/contact.component';
import { BlogComponent } from './blog/blog.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { PaperplaneComponent } from './paperplane/paperplane.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'news', component: NewsComponent, pathMatch: 'full' },
  { path: 'news/:id/:slug', component: NewsArticleComponent },
  { path: 'about', component: AboutComponent },
  { path: 'showcase', component: ShowcaseComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'blog', component: BlogComponent, pathMatch: 'full' },
  { path: 'blog/:id/:slug', component: BlogPostComponent },
  { path: 'paperplane', component: PaperplaneComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
