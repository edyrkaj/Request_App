import { Component } from '@angular/core';

@Component({
  template: `
    <h1 mat-dialog-title>Add file</h1>
    <mat-dialog-content>
      Content goes here
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button>Add</button>
      <button mat-button>Cancel</button>
    </mat-dialog-actions>
  `
})
export class PayDialogComponent {}