import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../../util/web3.service'

@Component({
  templateUrl: './pay-dialog.component.html'
})
export class PayDialogComponent {
  request;
  payForm: FormGroup;
  amountFormControl: FormControl;

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private dialogRef: MatDialogRef < PayDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;
  }


  ngOnInit() {
    this.amountFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]*([\.][0-9]{0,18})?$'])
    this.payForm = this.formBuilder.group({
      amountFormControl: this.amountFormControl,
    })
  }

  setMax() {
    console.log('test');
    this.amountFormControl.setValue(this.web3Service.fromWei(this.request.expectedAmount));
  }


  submit() {
    this.dialogRef.close(this.amountFormControl.value);
  }
}
