import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../../util/web3.service'

@Component({
  templateUrl: './refund-dialog.component.html'
})
export class RefundDialogComponent implements OnInit {
  request;
  refundForm: FormGroup;
  refundFormControl: FormControl;

  constructor(public web3Service: Web3Service, private formBuilder: FormBuilder, private dialogRef: MatDialogRef < RefundDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;
  }


  ngOnInit() {
    this.refundFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]*([\.][0-9]{0,18})?$')]);
    this.refundForm = this.formBuilder.group({
      refundFormControl: this.refundFormControl,
    });
  }


  setMax() {
    this.refundFormControl.setValue(this.web3Service.fromWei(this.request.balance);
  }


  submit() {
    this.dialogRef.close(this.refundFormControl.value);
  }
}