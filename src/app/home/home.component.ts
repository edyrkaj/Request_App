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
  amountExpectedFormControl = new FormControl('', [Validators.required, this.positiveNumberValidator]);
  payerFormControl = new FormControl('', [Validators.required, Validators.pattern('^(0x)?[0-9a-fA-F]{40}$')]);
  reasonFormControl = new FormControl('');
  dateFormControl = new FormControl('');
  // currency = new FormControl('ETH');
  // currencies = [{ name: 'ether', iso: 'ETH' }];

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private router: Router) {
    setInterval(() => { this.date = new Date() }, 1000);
    this.web3Service.setSearchValue(null);
  }

  ngOnInit(): void {
    this.watchAccount();

    this.requestForm = this.formBuilder.group({
      amountExpected: this.amountExpectedFormControl,
      payer: this.payerFormControl,
      date: this.dateFormControl,
      reason: this.reasonFormControl,
    });

  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.account = accounts[0];
    });
  }

  positiveNumberValidator(control: FormControl) {
    return Number(control.value) < 0 ? { negativeNumber: true } : null;
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
      if (this.amountExpectedFormControl.hasError('required')) {
        this.amountExpectedFormControl.markAsTouched();
        this.amountExpectedFormControl.setErrors({ required: true });
      }
      if (this.payerFormControl.hasError('required')) {
        this.payerFormControl.markAsTouched();
        this.payerFormControl.setErrors({ required: true });
      }
      return this.formDisabled = true;
    }
    this.requestForm.controls['date'].setValue(this.date);

    let data = {};
    Object.keys(this.requestForm.value).forEach((key) => {
      if (key !== 'amountExpected' && key !== 'payer')
        data[key] = this.requestForm.value[key];
    })

    await this.web3Service.createRequestAsPayeeAsync(this.payerFormControl.value, this.amountExpectedFormControl.value, JSON.stringify(data)).then(
      response => {
        console.log(response);
        this.router.navigate(['/request', this.requestForm.value]);
      })




    // let result = await this.web3Service.createRequestAsPayeeAsync(this.payerFormControl.value, this.amountExpectedFormControl.value, `{"reason": "${this.reasonFormControl.value}", "date": "${this.date}"}`);
    // if (result && result.request && result.request.requestId) {
    //   this.web3Service.setSearchValue(result.request.requestId);
    //   this.router.navigate(['/request', result.request.requestId]);
    // }
  }


}
