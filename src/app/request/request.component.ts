import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss'],
})
export class RequestComponent implements OnInit {
  requestId;

  constructor(private router: Router,
    private route: ActivatedRoute) {}

  ngOnInit() {
    if (this.route.snapshot.queryParams['requestId']) {
      this.requestId = this.route.snapshot.queryParams['requestId'];
      // this.getRequestById();
    }
  }

}
