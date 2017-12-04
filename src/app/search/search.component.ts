import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../util/web3.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchValue: string;
  dataSource;

  constructor(private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    // wait for web3 to be instantiated
    if (!this.web3Service || !this.web3Service.ready) {
      const delay = new Promise(resolve => setTimeout(resolve, 1000));
      await delay;
      return await this.ngOnInit();
    }

    this.web3Service.searchValue.subscribe(async(searchValue) => {
      this.searchValue = searchValue;
      await this.listRequest();
    })

    if (this.route.snapshot.params['searchValue']) {

      this.web3Service.setSearchValue(this.route.snapshot.params['searchValue']);
    }
  }


  async listRequest() {
    let result = [await this.web3Service.getRequestAsync(this.searchValue)];
    this.dataSource = new MatTableDataSource(result);
    console.log(this.dataSource)
  }
}
