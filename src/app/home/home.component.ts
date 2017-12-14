import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Web3Service } from '../util/web3.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  date: number = new Date().getTime();
  formDisabled: boolean = false;
  account: string;
  createLoading: boolean = false;

  requestForm: FormGroup;
  expectedAmountFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]*([\.,][0-9]{0,18})?$')]);
  payerFormControl = new FormControl('', [Validators.required, Validators.pattern('^(0x)?[0-9a-fA-F]{40}$')]);


  reasonFormControl = new FormControl('');
  dateFormControl = new FormControl('');
  // currency = new FormControl('ETH');
  // currencies = [{ name: 'ether', iso: 'ETH' }];

  constructor(public snackBar: MatSnackBar, private web3Service: Web3Service, private formBuilder: FormBuilder, private router: Router) {
    setInterval(() => { this.date = new Date().getTime() }, 1000);
    this.web3Service.setSearchValue(null);
  }

  ngOnInit() {
    this.watchAccount();

    this.requestForm = this.formBuilder.group({
      expectedAmount: this.expectedAmountFormControl,
      payer: this.payerFormControl,
      date: this.dateFormControl,
      Reason: this.reasonFormControl,
    });
  }

  watchAccount() {
    if (!this.account && this.web3Service.accounts) {
      this.account = this.web3Service.accounts[0];
    }
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.account = accounts[0];
    });
  }

  test() {
    console.log(this.expectedAmountFormControl.value);
  }

  // positiveNumberValidator(control: FormControl) {
  //   return Number(control.value) < 0 ? { negativeNumber: true } : null;
  // }

  // VALIDATOR
  // isPayeeAddress(account: string) {
  // return (input: FormControl) {
  //   const isPayeeAddress = this.account && input.value.toLowerCase() == this.account.toLowerCase();
  //   return isPayeeAddress ? { isPayeeAddress: true } : null;
  //   }
  // }

  createRequest() {
    if (this.createLoading) return;
    // if (!this.web3Service.requestNetwork) return this.snackBar.open('Request Network smart contracts are not deployed on this network.', 'Ok', { duration: 10000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: 'warning-snackbar' });
    // if (!this.account) return this.snackBar.open('You need to connect your Metamask wallet to create a Request.', 'Ok', { duration: 10000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: 'warning-snackbar' });
    // if (this.account == this.payerFormControl.value) return this.snackBar.open('Payer\'s address must be different from yours.', 'Ok', { duration: 10000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: 'warning-snackbar' });

    this.createLoading = true;
    
    if (!this.requestForm.valid) {
      if (this.expectedAmountFormControl.hasError('required')) {
        this.expectedAmountFormControl.markAsTouched();
        this.expectedAmountFormControl.setErrors({ required: true });
      }
      if (this.payerFormControl.hasError('required')) {
        this.payerFormControl.markAsTouched();
        this.payerFormControl.setErrors({ required: true });
      }
      this.createLoading = false;
      return this.formDisabled = true;
    }
    this.requestForm.controls['date'].setValue(this.date);

    let data = {};
    Object.keys(this.requestForm.value).forEach(key => {
      if (key !== 'expectedAmount' && key !== 'payer' && this.requestForm.value[key] && this.requestForm.value[key] != '')
        data[key] = this.requestForm.value[key];
    })

    this.web3Service.createRequestAsPayee(this.payerFormControl.value, this.expectedAmountFormControl.value, JSON.stringify(data), response => {
      this.createLoading = false;
      if (response && response.transactionHash) {
        this.snackBar.open('Transaction in progress', 'Ok', { duration: 3000 });
        
        let queryParams = {
          expectedAmount: this.expectedAmountFormControl.value,
          payer: this.payerFormControl.value,
          payee: this.account,
        };
        Object.keys(data).forEach(key => queryParams[key] = data[key])

        this.router.navigate(['/request/txHash', response.transactionHash], { queryParams });
      } else if (response && response.message) {
        this.snackBar.open(response.message, 'Ok', { duration: 5000 });
      }
    });
  }

}
