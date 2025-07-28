import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Standalone Components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SiteListComponent } from './components/site-list/site-list.component';
import { SiteDetailComponent } from './components/site-detail/site-detail.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ReviewListComponent } from './components/review-list/review-list.component';
import { HeaderComponent } from './layout/header/header.component';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  //  REMOVE declarations
  //  USE imports instead
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,

    // ✅ Add components here instead
    AppComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    SiteListComponent,
    SiteDetailComponent,
    FavoritesComponent,
    ProfileComponent,
    ReviewListComponent,
    HeaderComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

