import { Component, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../util/web3.service';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, AfterViewInit, OnDestroy {
  date = new Date().getTime();
  searchValue: string;
  subscription;
  displayedColumns = ['requestId', '_meta.timestamp', 'request.payee', 'request.payer', 'request.expectedAmount', 'request.balance', 'request.status'];
  dataSource = new MatTableDataSource();
  loading = true;

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
      const resultsList = await this.web3Service.getRequestsByAddress(searchValue);
      this.loading = false;
      if (!resultsList || !resultsList.asPayer || !resultsList.asPayee) {
        return this.dataSource.data = [];
      }
      let requests = resultsList.asPayer.concat(resultsList.asPayee);
      requests = requests.sort((a, b) => b._meta.timestamp - a._meta.timestamp);
      this.getRequestsFromIds(requests);
      this.dataSource.data = requests;
    });

    if (this.route.snapshot.params['searchValue']) {
      setTimeout(() => this.web3Service.setSearchValue(this.route.snapshot.params['searchValue']));
    }
  }


  getRequestsFromIds(requests) {
    for (const request of requests) {
      this.web3Service.getRequestByRequestIdAsync(request.requestId).then(
        response => {
          request.request = response;
        });
    }
  }


  getAgeFromTimeStamp(timestamp) {
    if (!timestamp) { return ''; }
    const time = this.date - timestamp * 1000;
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    let msg = days === 1 ? `${days} day ` : days > 1 ? `${days} days ` : '';
    const hours = Math.floor(time / (1000 * 60 * 60) % 24);
    msg += days === 1 ? `${hours} hr ` : hours > 1 ? `${hours} hrs ` : '';
    const minutes = Math.floor(time / (1000 * 60) % 60);
    msg += minutes === 1 ? `${minutes} min ` : minutes > 1 ? `${minutes} mins ` : '';
    return msg ? `${msg}ago` : 'less than 1 min ago';
  }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
