import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  templateUrl: './pay-dialog.component.html'
})
export class PayDialogComponent {

 form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<PayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data
  ) {}
  
  ngOnInit() {
    this.form = this.formBuilder.group({
      filename: ''
    })
  }

  submit(form) {
    this.dialogRef.close(`${form.value.filename}`);
  }
}