import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { MatSnackBar } from '@angular/material';

import Web3 from 'web3';
import RequestNetwork from 'requestnetwork.js/dist/src/requestNetwork';

declare let window: any;

@Injectable()
export class Web3Service {
  private web3: Web3;
  private requestNetwork: RequestNetwork;
  private infuraNodeUrl = 'https://rinkeby.infura.io/BQBjfSi5EKSCQQpXebO';
  private metamaskConnected: boolean = true;


  public etherscanUrl: string;
  public accounts: string[];
  public ready: boolean = false;

  public accountsObservable = new Subject < string[] > ();
  public searchValue = new Subject < string > ();
  public request = new Subject < any > ();

  public fromWei;
  public toWei;
  public BN;

  web3NotReadyMsg: string = 'Error when trying to instanciate web3.';
  requestNetworkNotReadyMsg: string = 'Request Network smart contracts are not deployed on this network.'
  metamaskNotReadyMsg: string = 'Connect your Metamask wallet to create or interact with a Request.';

  constructor(public snackBar: MatSnackBar) {
    window.addEventListener('load', event => {
      console.log('web3service instantiate web3');
      this.checkAndInstantiateWeb3();
    });
  }


  private setEtherscanUrl(networkId) {
    switch (networkId) {
      case 1:
        this.etherscanUrl = 'https://etherscan.io/';
        break;
      case 3:
        this.etherscanUrl = 'https://ropsten.etherscan.io/';
        break;
      case 4:
        this.etherscanUrl = 'https://rinkeby.etherscan.io/';
        break;
      case 42:
        this.etherscanUrl = 'https://kovan.etherscan.io/';
        break;
      default:
        break;
    }
  }


  private watchDog() {
    let stop = !this.web3 || !this.requestNetwork || !this.metamaskConnected;
    if (stop) this.openSnackBar();
    return stop;
  }


  public openSnackBar(msg ? : string, ok ? : string, panelClass ? : string) {
    if (!msg) {
      msg = !this.web3 ? this.web3NotReadyMsg : !this.requestNetwork ? this.requestNetworkNotReadyMsg : !this.metamaskConnected ? this.metamaskNotReadyMsg : '';
      if (msg == '') return;
    }

    this.snackBar.open(msg, ok || 'Ok', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: panelClass || 'warning-snackbar',
    });
  }


  private checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.log('Using web3 detected from external source. If you find that your accounts don\'t appear, ensure you\'ve configured that source properly.');
      this.web3 = new Web3(window.web3.currentProvider);

      // Start requestnetwork Library
      this.web3.eth.net.getId().then(
        networkId => {
          try {
            this.setEtherscanUrl(networkId);
            this.requestNetwork = new RequestNetwork(this.web3.givenProvider, networkId);
          } catch (err) {
            if (this.web3) this.openSnackBar(this.requestNetworkNotReadyMsg);
            console.log('Error: ', err.message);
          }
        }, err => {
          console.error('Error:', err);
        });
    } else {
      console.warn(`No web3 detected. Falling back to ${this.infuraNodeUrl}.`);
      this.web3 = new Web3(new Web3.providers.HttpProvider(this.infuraNodeUrl));
      this.requestNetwork = new RequestNetwork(this.web3.givenProvider, 4);
    }

    this.fromWei = this.web3.utils.fromWei;
    this.toWei = this.web3.utils.toWei;
    this.BN = mixed => new this.web3.utils.BN(mixed);

    this.ready = true;
    setInterval(() => this.refreshAccounts(), 1000);
  }


  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null || accs.length == 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        if (this.requestNetwork && this.metamaskConnected) {
          this.metamaskConnected = false;
          this.openSnackBar(this.metamaskNotReadyMsg);
        }
        return this.accountsObservable.next(accs);
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');
        this.accountsObservable.next(accs);
        this.accounts = accs;
        if (accs.length) this.metamaskConnected = true;
      }
    });
  }


  public async setSearchValue(searchValue: string) {
    this.searchValue.next(searchValue);
    if (!searchValue) return;

    let result = await this.getRequestAsync(searchValue);

    if (!result || !result.requestId || result.creator == '0x0000000000000000000000000000000000000000')
      this.request.next({ 'requestId': null });
    else
      this.request.next(result);
  }


  public createRequestAsPayee(payer: string, expectedAmount: string, data: string, callback ? ) {
    if (this.watchDog()) return callback();

    console.log('RequestNetworkService createRequestAsPayee');
    let expectedAmountInWei = this.toWei(expectedAmount, 'ether');
    this.requestNetwork.requestEthereumService.createRequestAsPayee(payer, expectedAmountInWei, data).on('broadcasted', response => {
      console.log('callback createRequestAsPayee: ', response);
      callback(response);
    }).then(
      response => {
        console.log('resolve createRequestAsPayee: ', response);
        response.request.transactionHash = response.transactionHash;
        this.request.next(response.request);
      }, err => {
        console.log('Error:', err);
        callback(err);
      });
  }


  public cancel(requestId: string, callback ? ) {
    if (this.watchDog()) return callback();

    console.log('RequestNetworkService cancel');
    this.requestNetwork.requestEthereumService.cancel(requestId).on('broadcasted', response => {
      callback(response);
    }).then(
      response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(response.request);
      }, err => {
        console.log('Error:', err);
        callback(err);
      });
  }


  public accept(requestId: string, callback ? ) {
    if (this.watchDog()) return callback();

    console.log('RequestNetworkService accept');
    this.requestNetwork.requestEthereumService.accept(requestId).on('broadcasted', response => {
      callback(response);
    }).then(
      response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(response.request);
      }, err => {
        console.log('Error:', err);
        callback(err);
      });
  }


  public subtractAction(requestId: string, amount: string, callback ? ) {
    if (this.watchDog()) return callback();

    console.log('RequestNetworkService subtractAction');
    let amountInWei = this.toWei(amount.toString(), 'ether');
    this.requestNetwork.requestEthereumService.subtractAction(requestId, amountInWei).on('broadcasted', response => {
      callback(response);
    }).then(
      response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(response.request);
      }, err => {
        console.log('Error:', err);
        callback(err);
      });
  }


  public additionalAction(requestId: string, amount: string, callback ? ) {
    if (this.watchDog()) return callback();

    console.log('RequestNetworkService additionalAction');
    let amountInWei = this.toWei(amount.toString(), 'ether');
    this.requestNetwork.requestEthereumService.additionalAction(requestId, amountInWei).on('broadcasted', response => {
      callback(response);
    }).then(
      response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(response.request);
      }, err => {
        console.log('Error:', err);
        callback(err);
      });
  }


  public paymentAction(requestId: string, amount: string, callback ? ) {
    if (this.watchDog()) return callback();

    console.log('RequestNetworkService pay');
    let amountInWei = this.toWei(amount.toString(), 'ether');
    this.requestNetwork.requestEthereumService.paymentAction(requestId, amountInWei, 0).on('broadcasted', response => {
      callback(response);
    }).then(
      response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(response.request);
      }, err => {
        console.log('Error:', err);
        callback(err);
      });
  }


  public async getRequestAsync(requestId: string) {
    try {
      console.log('RequestNetworkService getRequest by id');
      let request = await this.requestNetwork.requestCoreService.getRequest(requestId);
      console.log('getRequest by id result: ', request);
      return request;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


  public async getRequestByTransactionHashAsync(requestId: string) {
    try {
      console.log('RequestNetworkService getRequest by txHash');
      let request = await this.requestNetwork.requestCoreService.getRequestByTransactionHash(requestId);
      console.log('getRequest by txHash result: ', request);
      return request;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


  public async getRequestHistory(requestId: string) {
    try {
      console.log('RequestNetworkService getRequestHistory');
      let request = await this.requestNetwork.requestCoreService.getRequestHistory(requestId);
      console.log('getRequestHistory result: ', request);
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


}
