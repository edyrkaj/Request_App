import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../util/web3.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
})
export class RequestComponent implements OnInit {
  requestId;
  request;

  constructor(private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {

  }

  async ngOnInit() {
    if (!this.web3Service || !this.web3Service.ready) {
      const delay = new Promise(resolve => setTimeout(resolve, 1000));
      await delay;
      return await this.ngOnInit();
    }
    if (this.route.snapshot.queryParams['requestId']) {
      this.requestId = this.route.snapshot.queryParams['requestId'];
      this.request = await this.web3Service.getRequestAsync(this.requestId);
      console.log(this.request);
    }
  }
  
}
