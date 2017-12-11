import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  templateUrl: './subtract-dialog.component.html'
})
export class SubtractDialogComponent {
  request;
  subtractForm: FormGroup;
  subtractAmountFormControl;
  superiorToExpectedAmountValidator;

  constructor(private formBuilder: FormBuilder, private dialogRef: MatDialogRef < SubtractDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;

    this.superiorToExpectedAmountValidator = (control: FormControl) => {
      return this.request && this.request.expectedAmount - Number(control.value) <= 0 ? { superiorNumber: true } : null;
    }
  }


  ngOnInit() {
    this.subtractAmountFormControl = new FormControl('', [Validators.required, , this.positiveNumberValidator, this.superiorToExpectedAmountValidator])

    this.subtractForm = this.formBuilder.group({
      subtractAmountFormControl: this.subtractAmountFormControl,
    })
  }


  positiveNumberValidator(control: FormControl) {
    return Number(control.value) <= 0 ? { negativeNumber: true } : null;
  }


  submit() {
    this.dialogRef.close(this.subtractAmountFormControl.value);
  }


}
