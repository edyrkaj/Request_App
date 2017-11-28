import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Web3Service } from '../util/web3.service';
import blockies from 'blockies';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
})
export class RequestComponent implements OnInit {
  requestId: string;
  request: any;
  fromIcon;
  toIcon;
  objectKeys = Object.keys;

  constructor(private web3Service: Web3Service, private router: Router, private route: ActivatedRoute) {

  }

  async ngOnInit() {
    if (!this.web3Service || !this.web3Service.ready) {
      const delay = new Promise(resolve => setTimeout(resolve, 1000));
      await delay;
      return await this.ngOnInit();
    }

    if (this.route.snapshot.params['requestId']) {
      this.requestId = this.route.snapshot.params['requestId'];
      this.request = await this.web3Service.getRequestAsync(this.requestId);
      this.fromIcon = blockies({
        seed: this.request.payee.toLowerCase(),
      });
      this.toIcon = blockies({
        seed: this.request.payer.toLowerCase(),
      });
      console.log(this.request);
    }
  }

}
