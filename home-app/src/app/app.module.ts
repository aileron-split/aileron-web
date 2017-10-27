import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { WeathertankLauncherComponent } from './weathertank-launcher/weathertank-launcher.component';
import { WeathertankComponent } from './weathertank/weathertank.component';
import { BlogComponent } from './blog/blog.component';
import { ShowcaseComponent } from './showcase/showcase.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    AboutComponent,
    ContactComponent,
    WeathertankLauncherComponent,
    WeathertankComponent,
    BlogComponent,
    ShowcaseComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
