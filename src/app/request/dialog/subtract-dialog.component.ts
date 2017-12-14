import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../../util/web3.service'

@Component({
  templateUrl: './subtract-dialog.component.html'
})
export class SubtractDialogComponent {
  request;
  subtractForm: FormGroup;
  subtractAmountFormControl:FormControl;
  superiorToExpectedAmountValidator;

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private dialogRef: MatDialogRef < SubtractDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;

    this.superiorToExpectedAmountValidator = (control: FormControl) => {
      console.log(control.value);
      return control.value && !isNaN(control.value) && this.request && this.request.expectedAmount.sub(this.web3Service.BN(this.web3Service.toWei(control.value.toString()))) <= 0 ? { superiorNumber: true } : null;
    }
  }

  ngOnInit() {
    this.subtractAmountFormControl = new FormControl('', [Validators.required, , Validators.pattern('[0-9]*([\.][0-9]{0,18})?$'), this.superiorToExpectedAmountValidator])

    this.subtractForm = this.formBuilder.group({
      subtractAmountFormControl: this.subtractAmountFormControl,
    })
  }


  submit() {
    this.dialogRef.close(this.subtractAmountFormControl.value);
  }


}
