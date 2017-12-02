import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatCardModule, MatMenuModule, MatToolbarModule, MatIconModule, MatTabsModule, MatGridListModule, MatTooltipModule } from '@angular/material';
import { LightboxModule } from 'angular2-lightbox';

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
import { TeamService } from './team.service';
import { HomeComponent } from './home/home.component';
import { SafePipe } from './safe.pipe';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { FilterComponent } from './filter/filter.component';
import { ResolveTagsPipe } from './resolve-tags.pipe';


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
    NewsArticlePreviewComponent,
    HomeComponent,
    SafePipe,
    BreadcrumbsComponent,
    FilterComponent,
    ResolveTagsPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    MatCardModule,
    MatGridListModule,
    MatTooltipModule,
    LightboxModule,
  ],
  providers: [AnimateService, NewsService, BlogService, TeamService],
  bootstrap: [AppComponent]
})
export class AppModule { }
