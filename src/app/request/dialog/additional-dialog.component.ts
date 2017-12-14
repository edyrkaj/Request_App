import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../../util/web3.service'

@Component({
  templateUrl: './additional-dialog.component.html'
})
export class AdditionalDialogComponent {
  request;
  additionalForm: FormGroup;
  additionalAmountFormControl: FormControl;
  superiorToExpectedAmountValidator;

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private dialogRef: MatDialogRef < AdditionalDialogComponent > , @Inject(MAT_DIALOG_DATA) private data: any) {
    this.request = data.request;
  }


  ngOnInit() {
    this.additionalAmountFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]*([\.][0-9]{0,18})?$'])
    this.additionalForm = this.formBuilder.group({
      additionalAmountFormControl: this.additionalAmountFormControl
    })
  }


  submit() {
    this.dialogRef.close(this.additionalAmountFormControl.value);
  }


}
