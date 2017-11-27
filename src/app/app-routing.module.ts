import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { RequestComponent } from './request/request.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'request/:requestId', component: RequestComponent },
  { path: '**', redirectTo: '/' },

  // // {
  // //   path: 'settings',
  // //   component: SettingsComponent,
  // //   data: {
  // //     title: 'Settings'
  // //   }
  // // },
  // {
  //   path: 'examples',
  //   loadChildren: 'app/examples/examples.module#ExamplesModule'
  // },
  // {
  //   path: '**',
  //   redirectTo: 'about'
  // }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
