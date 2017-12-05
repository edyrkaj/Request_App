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
  metamaskReady: boolean = true;
  icon;

  constructor(public snackBar: MatSnackBar, private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.watchAccount();

    this.web3Service.searchValue.subscribe(async(searchValue) => {
      this.searchValue = searchValue;
    })

    this.web3Service.metamaskReady.subscribe((metamaskReady) => {
      if (this.metamaskReady != metamaskReady && !metamaskReady) {
        this.metamaskReady = metamaskReady;
        this.openSnackBar();
      }
    })
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.account = accounts[0];
      this.icon = blockies({
        seed: this.account.toLowerCase(),
      });
    });
  }

  openSnackBar() {
    this.snackBar.open('You need to connect your Metamask wallet to create a Request', 'Ok', {
      duration: 10000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: 'metamask-snackbar',
    });
  }

  search() {
    this.web3Service.setSearchValue(this.searchValue);
    if (this.searchValue && this.searchValue.length <= 42)
      this.router.navigate(['/search', this.searchValue]);
    else
      this.router.navigate(['/request', this.searchValue]);
  }

  goHome() {
    this.web3Service.setSearchValue(null);
    this.router.navigate(['/']);
  }


}
