import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule, MatIconModule, MatTabsModule, MatGridListModule } from '@angular/material';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { FooterComponent } from './footer/footer.component';
import { PaperplaneComponent } from './paperplane/paperplane.component';
import { PaperplaneLauncherComponent } from './paperplane-launcher/paperplane-launcher.component';
import { BlogComponent } from './blog/blog.component';
import { NewsComponent } from './news/news.component';
import { NewsArticleComponent } from './news-article/news-article.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { BlogPostPreviewComponent } from './blog-post-preview/blog-post-preview.component';
import { NewsArticlePreviewComponent } from './news-article-preview/news-article-preview.component';

import { AnimateService } from './animate.service';
import { NewsService } from './news.service';
import { BlogService } from './blog.service';


@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    AboutComponent,
    ContactComponent,
    ShowcaseComponent,
    FooterComponent,
    PaperplaneComponent,
    PaperplaneLauncherComponent,
    BlogComponent,
    NewsComponent,
    NewsArticleComponent,
    BlogPostComponent,
    BlogPostPreviewComponent,
    NewsArticlePreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatCardModule,
    MatGridListModule
  ],
  providers: [AnimateService, NewsService, BlogService],
  bootstrap: [AppComponent]
})
export class AppModule { }
