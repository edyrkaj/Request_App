import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from './shared/shared.module';


import { AppRoutingModule } from './app-routing.module';
import { UtilModule } from './util/util.module';

import { AppComponent } from './app.component';
import { RequestComponent } from './request/request.component';


@NgModule({
  declarations: [
    AppComponent,
    RequestComponent
  ],
  imports: [
    // angular
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    // features
    SharedModule,
    UtilModule,

    // app
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
