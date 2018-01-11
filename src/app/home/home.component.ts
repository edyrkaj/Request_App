import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder, ValidationErrors } from '@angular/forms';
import { Web3Service } from '../util/web3.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  date: number = new Date().getTime();
  formDisabled = false;
  account: string;
  createLoading = false;

  requestForm: FormGroup;
  expectedAmountFormControl: FormControl;
  payeeFormControl: FormControl;
  payerFormControl: FormControl;
  reasonFormControl: FormControl;
  dateFormControl: FormControl;
  // currency = new FormControl('ETH');
  // currencies = [{ name: 'ether', iso: 'ETH' }];

  static payerAddressValidator(control: FormControl) {
    const sameAsAccount = control.value && control.root.get('payee').value === control.value;
    return sameAsAccount ? { sameAsAccount: true } : null;
  }

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private router: Router) {}


  ngOnInit() {
    setInterval(_ => { this.date = new Date().getTime(); }, 5000);
    setTimeout(_ => this.web3Service.setSearchValue(''));

    this.watchAccount();

    this.expectedAmountFormControl = new FormControl('', [Validators.required, Validators.pattern('[0-9]*([\.][0-9]{0,18})?$')]);
    this.payerFormControl = new FormControl('', [Validators.required, Validators.pattern('^(0x)?[0-9a-fA-F]{40}$'), HomeComponent.payerAddressValidator]);
    this.payeeFormControl = new FormControl(this.account);
    this.dateFormControl = new FormControl('');
    this.reasonFormControl = new FormControl('');

    this.requestForm = this.formBuilder.group({
      expectedAmount: this.expectedAmountFormControl,
      payee: this.payeeFormControl,
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
      this.payeeFormControl.setValue(this.account);
      this.payerFormControl.updateValueAndValidity();
    });
  }


  createRequest() {
    if (this.createLoading) { return; }

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

    const data = {};
    Object.keys(this.requestForm.value).forEach(key => {
      if (key !== 'expectedAmount' && key !== 'payer' && this.requestForm.value[key] && this.requestForm.value[key] !== '') {
        data[key] = this.requestForm.value[key];
      }
    });

    this.web3Service.createRequestAsPayee(this.payerFormControl.value, this.expectedAmountFormControl.value, JSON.stringify(data), response => {
      this.createLoading = false;
      if (response && response.transactionHash) {
        this.web3Service.openSnackBar('Transaction in progress.', 'Ok', 'success-snackbar');

        const queryParams = {
          expectedAmount: this.expectedAmountFormControl.value,
          payer: this.payerFormControl.value,
          payee: this.payeeFormControl.value,
        };
        Object.keys(data).forEach(key => queryParams[key] = data[key]);

        this.router.navigate(['/request/txHash', response.transactionHash], { queryParams });
      } else if (response && response.message) {
        this.web3Service.openSnackBar(response.message);
      }
    });
  }

  test(test) {
    console.log('test:', test);
  }

}
