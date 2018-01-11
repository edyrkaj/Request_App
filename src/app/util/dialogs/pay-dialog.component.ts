import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../../util/web3.service';

@Component({
  templateUrl: './pay-dialog.component.html'
})
export class PayDialogComponent implements OnInit {
  request;
  payForm: FormGroup;
  amountFormControl: FormControl;

  constructor(public web3Service: Web3Service, private formBuilder: FormBuilder, private dialogRef: MatDialogRef < PayDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;
  }


  ngOnInit() {
    this.amountFormControl = new FormControl(this.web3Service.fromWei(this.request.expectedAmount.sub(this.request.balance)), [Validators.required, Validators.pattern('[0-9]*([\.][0-9]{0,18})?$')]);
    this.payForm = this.formBuilder.group({
      amountFormControl: this.amountFormControl,
    });
  }


  setMax() {
    this.amountFormControl.setValue(this.web3Service.fromWei(this.request.expectedAmount.sub(this.request.balance)));
  }


  submit() {
    this.dialogRef.close(this.amountFormControl.value);
  }

}
