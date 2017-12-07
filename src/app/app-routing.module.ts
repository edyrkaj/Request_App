import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { RequestComponent } from './request/request.component';
import { SearchComponent } from './search/search.component';


const routes: Routes = [
  { pathMatch: 'full', path: '', component: HomeComponent },
  { pathMatch: 'full', path: 'request/txHash/:txHash', component: RequestComponent },
  { pathMatch: 'full', path: 'request/requestId/:requestId', component: RequestComponent },
  { pathMatch: 'full', path: 'search/:searchValue', component: SearchComponent },
  { pathMatch: 'full', path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
