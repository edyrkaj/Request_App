import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Web3Service } from '../util/web3.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  date: Date;
  formDisabled: boolean = false;
  account: string;

  requestForm: FormGroup;
  amountFormControl = new FormControl('', [Validators.required]);
  payerAddressFormControl = new FormControl('', [Validators.required, Validators.pattern('^(0x)?[0-9a-fA-F]{40}$')]);
  reasonFormControl = new FormControl('', []);
  currency = new FormControl('ETH', []);

  currencies = [{ name: 'ether', iso: 'ETH' }];

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private router: Router) {
    setInterval(() => { this.date = new Date() }, 1000);
    this.web3Service.setSearchValue(null);
  }

  ngOnInit(): void {
    this.watchAccount();

    this.requestForm = this.formBuilder.group({
      amount: this.amountFormControl,
      payerAddress: this.payerAddressFormControl,
      reason: this.reasonFormControl,
    });

  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.account = accounts[0];
    });
  }

  // VALIDATOR
  // isPayeeAddress(account: string) {
  // return (input: FormControl) {
  //   const isPayeeAddress = this.account && input.value.toLowerCase() == this.account.toLowerCase();
  //   return isPayeeAddress ? { isPayeeAddress: true } : null;
  //   }
  // }


  async createRequest() {
    if (!this.requestForm.valid) {
      if (this.amountFormControl.hasError('required')) {
        this.amountFormControl.markAsTouched();
        this.amountFormControl.setErrors({ required: true });
      }
      if (this.payerAddressFormControl.hasError('required')) {
        this.payerAddressFormControl.markAsTouched();
        this.payerAddressFormControl.setErrors({ required: true });
      }
      return this.formDisabled = true;
    }

    let result = await this.web3Service.createRequestAsPayeeAsync(this.payerAddressFormControl.value, this.amountFormControl.value, `{"reason": "${this.reasonFormControl.value}", "date": "${this.date}"}`);
    if (result && result.request && result.request.requestId) {
      this.web3Service.setSearchValue(result.request.requestId);
      this.router.navigate(['/request', result.request.requestId]);
    }
  }


}
