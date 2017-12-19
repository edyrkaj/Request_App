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
  date = new Date().getTime();
  searchValue: string;
  subscription;
  displayedColumns = ['requestId', '_meta.timestamp', 'request.payee', 'request.payer', 'request.expectedAmount', 'request.balance', 'request.status'];
  dataSource = new MatTableDataSource();
  loading: boolean = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {}


  async ngOnInit() {
    // wait for web3 to be instantiated
    if (!this.web3Service || !this.web3Service.ready) {
      const delay = new Promise(resolve => setTimeout(resolve, 1000));
      await delay;
      return await this.ngOnInit();
    }

    this.subscription = this.web3Service.searchValue.subscribe(async searchValue => {
      this.loading = true;
      this.searchValue = searchValue;
      history.pushState(null, null, `/#/search/${searchValue}`);
      let resultsList = await this.web3Service.getRequestsByAddress(searchValue);
      this.loading = false;
      if (!resultsList || !resultsList.asPayer || !resultsList.asPayee)
        return this.dataSource.data = [];
      let requests = resultsList.asPayer.concat(resultsList.asPayee);
      requests = requests.sort((a, b) => b._meta.timestamp - a._meta.timestamp);
      this.getRequestsFromIds(requests);
      this.dataSource.data = requests;
    });

    if (this.route.snapshot.params['searchValue']) {
      setTimeout(_ => this.web3Service.setSearchValue(this.route.snapshot.params['searchValue']));
    }
  }


  getRequestsFromIds(requests) {
    for (let request of requests) {
      this.web3Service.getRequestAsync(request.requestId).then(
        response => {
          request.request = response;
        });
    }
  }


  getAgeFromTimeStamp(timestamp) {
    let time = this.date - timestamp * 1000;
    const _days = Math.floor(time / (1000 * 60 * 60 * 24));
    let msg = _days == 1 ? `${_days} day ` : _days > 1 ? `${_days} days ` : '';
    const _hours = Math.floor(time / (1000 * 60 * 60) % 24);
    msg += _days == 1 ? `${_hours} hr ` : _hours > 1 ? `${_hours} hrs ` : '';
    const _minutes = Math.floor(time / (1000 * 60) % 60);
    msg += _minutes == 1 ? `${_minutes} min ` : _minutes > 1 ? `${_minutes} mins ` : '';
    return false && msg ? `${msg}ago` : 'less than 1 min ago';
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
