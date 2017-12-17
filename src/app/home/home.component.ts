import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../util/web3.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  date: number = new Date().getTime();
  formDisabled: boolean = false;
  account: string;
  createLoading: boolean = false;

  requestForm: FormGroup;
  expectedAmountFormControl: FormControl;
  payerFormControl: FormControl;
  reasonFormControl: FormControl;
  dateFormControl: FormControl;
  // currency = new FormControl('ETH');
  // currencies = [{ name: 'ether', iso: 'ETH' }];

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private router: Router) {}


  ngOnInit() {
    setInterval(_ => { this.date = new Date().getTime() }, 5000);
    setTimeout(_ => this.web3Service.setSearchValue(''));

    this.watchAccount();

    this.expectedAmountFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]*([\.][0-9]{0,18})?$')]);
    this.payerFormControl = new FormControl('', [Validators.required, Validators.pattern('^(0x)?[0-9a-fA-F]{40}$')]);
    this.dateFormControl = new FormControl('');
    this.reasonFormControl = new FormControl('');

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


  createRequest() {
    if (this.createLoading) return;

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
    this.dateFormControl.setValue(this.date);

    let data = {};
    Object.keys(this.requestForm.value).forEach(key => {
      if (key !== 'expectedAmount' && key !== 'payer' && this.requestForm.value[key] && this.requestForm.value[key] != '')
        data[key] = this.requestForm.value[key];
    })

    this.web3Service.createRequestAsPayee(this.payerFormControl.value, this.expectedAmountFormControl.value, JSON.stringify(data), response => {
      this.createLoading = false;
      if (response && response.transactionHash) {
        this.web3Service.openSnackBar('Transaction in progress.', 'Ok', 'success-snackbar');

        let queryParams = {
          expectedAmount: this.expectedAmountFormControl.value,
          payer: this.payerFormControl.value,
          payee: this.account,
        };
        Object.keys(data).forEach(key => queryParams[key] = data[key])

        this.router.navigate(['/request/txHash', response.transactionHash], { queryParams });
      } else if (response && response.message) {
        this.web3Service.openSnackBar(response.message);
      }
    });
  }

}
