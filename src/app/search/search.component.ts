import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../util/web3.service';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  date: number = new Date().getTime();
  searchValue: string;
  subscription;
  displayedColumns = ['requestId', '_meta.timestamp'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {}

  async ngOnInit() {
    setInterval(_ => { this.date = new Date().getTime() }, 60000);
    
    // wait for web3 to be instantiated
    if (!this.web3Service || !this.web3Service.ready) {
      const delay = new Promise(resolve => setTimeout(resolve, 1000));
      await delay;
      return await this.ngOnInit();
    }

    this.subscription = this.web3Service.searchValue.subscribe(async searchValue => {
      this.searchValue = searchValue;
      let resultsList = await this.web3Service.getRequestsByAddress(searchValue);
      if (!resultsList || !resultsList.asPayer || !resultsList.asPayee) return this.dataSource.data = [];
      let requests = resultsList.asPayer.concat(resultsList.asPayee);
      await this.getRequestsFromIds(requests);
      this.dataSource.data = requests;
    });

    if (this.route.snapshot.params['searchValue']) {
      setTimeout(_ => this.web3Service.setSearchValue(this.route.snapshot.params['searchValue']));
    }
  }

  async getRequestsFromIds(requests) {
    for (let request of requests) {
      request.request = await this.web3Service.getRequestAsync(request.requestId);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
