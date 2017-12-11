import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  templateUrl: './pay-dialog.component.html'
})
export class PayDialogComponent {
  request;
  payForm: FormGroup;
  amountFormControl = new FormControl('', [Validators.required]);

  constructor(private formBuilder: FormBuilder, private dialogRef: MatDialogRef < PayDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;
  }

  ngOnInit() {
    this.payForm = this.formBuilder.group({
      amountFormControl: this.amountFormControl,
    })
  }

  submit() {
    this.dialogRef.close(this.amountFormControl.value);
  }
}
