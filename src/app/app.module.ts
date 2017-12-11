import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { UtilModule } from './util/util.module';
import { PayDialogComponent } from './request/dialog/pay-dialog.component';
import { UpdateDialogComponent } from './request/dialog/update-dialog.component';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RequestComponent } from './request/request.component';
import { SearchComponent } from './search/search.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RequestComponent,
    SearchComponent,
    PayDialogComponent,
    UpdateDialogComponent
  ],
  imports: [
    // angular
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    // Feature Modules
    ClipboardModule,

    // features
    SharedModule,
    UtilModule,

    // app
    AppRoutingModule,
  ],
  entryComponents: [
    // dialog
    PayDialogComponent,
    UpdateDialogComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
