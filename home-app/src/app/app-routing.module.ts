import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NewsComponent } from './news/news.component';
import { AboutComponent } from './about/about.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { ContactComponent } from './contact/contact.component';
import { DevblogComponent } from './devblog/devblog.component';
import { PaperplaneComponent } from './paperplane/paperplane.component';

const routes: Routes = [
  { path: '', redirectTo: '/blog', pathMatch: 'full'},
  { path: 'news', component: NewsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'showcase', component: ShowcaseComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'blog', component: DevblogComponent },
  { path: 'paperplane', component: PaperplaneComponent },
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule { }
