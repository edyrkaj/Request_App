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

  accounts: string[];
  account: string;
  searchValue: string;
  metamaskReady: boolean;
  requestNetworkReady: boolean;
  icon;

  constructor(public snackBar: MatSnackBar, private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.watchAccount();

    this.web3Service.searchValue.subscribe(searchValue => {
      this.searchValue = searchValue;
    })

    this.web3Service.requestNetworkReady.subscribe(requestNetworkReady => {
      if (!requestNetworkReady) this.snackBar.open('Request Network smart contracts are not deployed on this network.', 'Ok', { duration: 10000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: 'warning-snackbar' });
      this.requestNetworkReady = requestNetworkReady;
    });

    this.web3Service.metamaskReady.subscribe(metamaskReady => {
      if (this.requestNetworkReady && !metamaskReady && this.metamaskReady != metamaskReady) {
        this.snackBar.open('You need to connect your Metamask wallet to create a Request.', 'Ok', { duration: 10000, horizontalPosition: 'right', verticalPosition: 'top', panelClass: 'warning-snackbar' });
      }
      this.metamaskReady = metamaskReady;
    })
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      if (!accounts.length) return;
      this.accounts = accounts;
      this.account = accounts[0];
      this.icon = blockies({ seed: this.account.toLowerCase() });
    });
  }

  openSnackBar() {
    let msg = 'You need to connect your Metamask wallet to create a Request.'
    if (!this.requestNetworkReady) msg = 'Request Network smart contracts are not deployed on this network.';
    this.snackBar.open(msg, 'Ok', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'warning-snackbar',
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
