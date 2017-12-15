import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../../util/web3.service'

@Component({
  templateUrl: './subtract-dialog.component.html'
})
export class SubtractDialogComponent implements OnInit {
  request;
  subtractForm: FormGroup;
  subtractAmountFormControl: FormControl;
  superiorToExpectedAmountValidator;

  constructor(public web3Service: Web3Service, private formBuilder: FormBuilder, private dialogRef: MatDialogRef < SubtractDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;
  }


  ngOnInit() {
    this.superiorToExpectedAmountValidator = (control: FormControl) => {
      if (!control.value) return null;
      control.markAsTouched();
      return !isNaN(control.value) && this.request.expectedAmount.lte(this.web3Service.BN(this.web3Service.toWei(control.value.toString()))) ? { superiorNumber: true } : null;
    }

    this.subtractAmountFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]*([\.][0-9]{0,18})?$'), this.superiorToExpectedAmountValidator])

    this.subtractForm = this.formBuilder.group({
      subtractAmountFormControl: this.subtractAmountFormControl,
    })
  }


  submit() {
    this.dialogRef.close(this.subtractAmountFormControl.value);
  }

  
}
