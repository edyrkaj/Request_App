import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent implements OnInit {
  accounts: string[];
 
  amountFormControl = new FormControl('', [Validators.required]);
  payerAddressFormControl = new FormControl('', []);
  reasonFormControl = new FormControl('', []);
  currencies = [{name:'ether', iso:'ETH'}];

  currency = 'ETH';

  constructor() {
  }

  ngOnInit(): void {

  }

}
