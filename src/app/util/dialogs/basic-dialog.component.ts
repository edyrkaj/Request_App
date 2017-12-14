import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  templateUrl: './basic-dialog.component.html'
})
export class BasicDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef < BasicDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
  }


  submit() {
    this.dialogRef.close();
  }


}
