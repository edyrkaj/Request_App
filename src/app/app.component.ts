import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from './util/web3.service'
import { MatSnackBar } from '@angular/material';
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
  searchValue: string;

  constructor(public snackBar: MatSnackBar, private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.watchAccount();

    this.web3Service.searchValue.subscribe(searchValue => {
      this.searchValue = searchValue;
    })
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.accounts = accounts;
      this.account = accounts[0];
    });
  }

  search() {
    this.web3Service.setSearchValue(this.searchValue);
    if (this.searchValue && this.searchValue.length <= 42)
      this.router.navigate(['/search', this.searchValue]);
    else if (this.searchValue)
      this.router.navigate(['/request/requestId', this.searchValue]);
  }

}
