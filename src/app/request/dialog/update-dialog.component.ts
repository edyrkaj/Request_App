import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  templateUrl: './update-dialog.component.html'
})
export class UpdateDialogComponent {
  request;
  updateForm: FormGroup;
  subtractFormControl;
  superiorToExpectedAmountValidator;

  constructor(private formBuilder: FormBuilder, private dialogRef: MatDialogRef < UpdateDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;

    this.superiorToExpectedAmountValidator = (control: FormControl) => {
      return this.request && this.request.expectedAmount - Number(control.value) <= 0 ? { superiorNumber: true } : null;
    }
  }


  ngOnInit() {
    this.subtractFormControl = new FormControl('', [Validators.required, , this.positiveNumberValidator, this.superiorToExpectedAmountValidator])

    this.updateForm = this.formBuilder.group({
      subtractFormControl: this.subtractFormControl,
    })
  }


  positiveNumberValidator(control: FormControl) {
    return Number(control.value) <= 0 ? { negativeNumber: true } : null;
  }


  submit() {
    this.dialogRef.close(this.subtractFormControl.value);
  }


}
