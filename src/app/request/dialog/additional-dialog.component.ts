import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  templateUrl: './additional-dialog.component.html'
})
export class AdditionalDialogComponent {
  request;
  additionalForm: FormGroup;
  additionalAmountFormControl;
  superiorToExpectedAmountValidator;

  constructor(private formBuilder: FormBuilder, private dialogRef: MatDialogRef < AdditionalDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;
  }


  ngOnInit() {
    this.additionalAmountFormControl = new FormControl('', [Validators.required, , this.positiveNumberValidator])

    this.additionalForm = this.formBuilder.group({
      additionalAmountFormControl: this.additionalAmountFormControl
    })
  }


  positiveNumberValidator(control: FormControl) {
    return Number(control.value) <= 0 ? { negativeNumber: true } : null;
  }


  submit() {
    this.dialogRef.close(this.additionalAmountFormControl.value);
  }


}
