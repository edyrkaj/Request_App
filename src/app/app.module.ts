import { NgModule } from '@angular/core';
import { ClipboardModule } from 'ngx-clipboard';
import { PopoverModule } from 'ngx-popover';

import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';
import { UtilModule } from './util/util.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RequestComponent } from './request/request.component';
import { SearchComponent } from './search/search.component';

import { BasicDialogComponent } from './util/dialogs/basic-dialog.component';
import { PayDialogComponent } from './util/dialogs/pay-dialog.component';
import { SubtractDialogComponent } from './util/dialogs/subtract-dialog.component';
import { AdditionalDialogComponent } from './util/dialogs/additional-dialog.component';
import { RefundDialogComponent } from './util/dialogs/refund-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RequestComponent,
    SearchComponent,

    BasicDialogComponent,
    PayDialogComponent,
    SubtractDialogComponent,
    AdditionalDialogComponent,
    RefundDialogComponent
  ],
  imports: [
    // Feature Modules
    ClipboardModule,
    PopoverModule,

    // features
    SharedModule,
    UtilModule,

    // app
    AppRoutingModule,
  ],
  entryComponents: [
    BasicDialogComponent,
    PayDialogComponent,
    SubtractDialogComponent,
    AdditionalDialogComponent,
    RefundDialogComponent
  ],
  providers: [UtilModule, ],
  bootstrap: [AppComponent]
})
export class AppModule {}
