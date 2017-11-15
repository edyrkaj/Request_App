import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestComponent } from './request/request.component';

const routes: Routes = [
  {
     path: '',
    component: RequestComponent
  },
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
