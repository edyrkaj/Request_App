import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../util/web3.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  searchValue: string;
  subscription;
  dataSource;

  constructor(private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    // wait for web3 to be instantiated
    if (!this.web3Service || !this.web3Service.accounts) {
      const delay = new Promise(resolve => setTimeout(resolve, 1000));
      await delay;
      return await this.ngOnInit();
    }

    this.subscription = this.web3Service.searchValue.subscribe(async searchValue => {
      this.searchValue = searchValue;
      await this.listRequest(searchValue);
    })

    if (this.route.snapshot.params['searchValue']) {
      setTimeout(_ => this.web3Service.setSearchValue(this.route.snapshot.params['searchValue']));
    }
  }


  async listRequest(address) {
    let result = await this.web3Service.getRequestsByAddress(address);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
