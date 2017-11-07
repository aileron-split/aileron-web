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
import { DevblogComponent } from './devblog/devblog.component';
import { NewsComponent } from './news/news.component';
import { NewsArticleComponent } from './news-article/news-article.component';
import { DevblogArticleComponent } from './devblog-article/devblog-article.component';
import { DevblogArticlePreviewComponent } from './devblog-article-preview/devblog-article-preview.component';
import { NewsArticlePreviewComponent } from './news-article-preview/news-article-preview.component';

import { AnimateService } from './animate.service';

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
    DevblogComponent,
    NewsComponent,
    NewsArticleComponent,
    DevblogArticleComponent,
    DevblogArticlePreviewComponent,
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
  providers: [AnimateService],
  bootstrap: [AppComponent]
})
export class AppModule { }
