import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Web3Service } from './util/web3.service'
import { BasicDialogComponent } from './util/dialogs/basic-dialog.component';
import blockies from 'blockies';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  blockies = blockies;
  accounts: string[];
  account: string = 'loading';
  searchForm: FormGroup;
  searchValueFormControl: FormControl;

  constructor(private web3Service: Web3Service, private formBuilder: FormBuilder, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) {}


  ngOnInit() {
    this.watchAccount();

    this.searchValueFormControl = new FormControl('')
    this.searchForm = this.formBuilder.group({
      searchValueFormControl: this.searchValueFormControl
    })

    this.web3Service.searchValue.subscribe(searchValue => {
      this.searchValueFormControl.setValue(searchValue);
    })
  }


  ngAfterViewInit() {
    // wait for web3 to be instantiated
    // if (!this.web3Service || !this.web3Service.ready) {
    //   const delay = new Promise(resolve => setTimeout(resolve, 1000));
    //   await delay;
    //   return await this.ngAfterViewInit();
    // }

    // this.dialog.open(BasicDialogComponent, {
    //   hasBackdrop: true,
    //   width: '300px',
    //   data: {
    //     title: 'Welcome to the Request Network App',
    //     msg: 'At the moment, the website is deployed on the test net of Ethereum (Rinkeby), do not try to send real requests to customers',
    //     ok: 'Ok',
    //   }
    // });
  }


  watchAccount() {
    this.web3Service.accountsObservable.subscribe(accounts => {
      this.accounts = accounts;
      this.account = accounts[0];
    });
  }


  search(searchValue) {
    if (this.router.routerState.snapshot.url.startsWith('/request')) {
      if (searchValue.length <= 42)
        this.router.navigate(['/search', searchValue]);
      else
        this.web3Service.setSearchValue(searchValue);
    } else if (this.router.routerState.snapshot.url.startsWith('/search')) {
      if (searchValue.length > 42)
        this.router.navigate(['/request/requestId', searchValue]);
      else
        this.web3Service.setSearchValue(searchValue);
    } else {
      if (searchValue.length == 42)
        this.router.navigate(['/search', searchValue]);
      else if (searchValue.length > 42)
        this.router.navigate(['/request/requestId', searchValue]);
    }
  }


}
