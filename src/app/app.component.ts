import { Component, OnInit } from '@angular/core';
import { Web3Service } from './util/web3.service';

import { routerTransition } from './animations/router.transition';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routerTransition]
})
export class AppComponent implements OnInit {

  accounts: string[];
  account: string = '';

  constructor(private web3Service: Web3Service) {}

  ngOnInit(): void {
    this.watchAccount();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.account = accounts[0];
    });
  }

}
