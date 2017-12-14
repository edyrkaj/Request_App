import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from './util/web3.service'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import blockies from 'blockies';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  blockies = blockies;
  accounts: string[];
  account: string = 'loading';
  searchForm: FormGroup;
  searchValueFormControl: FormControl;

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.watchAccount();

    this.searchValueFormControl = new FormControl('', [Validators.required])
    this.searchForm = this.formBuilder.group({
      searchValueFormControl: this.searchValueFormControl
    })

    this.web3Service.searchValue.subscribe(searchValue => {
      this.searchValueFormControl.setValue(searchValue);
    })
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.accounts = accounts;
      this.account = accounts[0];
    });
  }

  search(searchValue) {
    this.web3Service.setSearchValue(searchValue);
    if (searchValue && searchValue.length <= 42)
      this.router.navigate(['/search', searchValue]);
    else if (searchValue)
      this.router.navigate(['/request/requestId', searchValue]);
  }

}
