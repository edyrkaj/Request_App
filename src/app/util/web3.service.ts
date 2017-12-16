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


  public openSnackBar(msg ? : string, ok ? : string, panelClass ? : string, duration ? : number) {
    if (!msg) {
      msg = !this.web3 ? this.web3NotReadyMsg : !this.requestNetwork ? this.requestNetworkNotReadyMsg : !this.metamaskConnected ? this.metamaskNotReadyMsg : '';
      if (msg == '') return;
    }

    this.snackBar.open(msg, ok || 'Ok', {
      duration: duration || 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: panelClass || 'warning-snackbar',
    });
  }


  public async setSearchValue(searchValue: string) {
    this.searchValue.next(searchValue)
    // if requestId
    if (searchValue && searchValue.length > 42) {
      this.request.next(null);
      let request = await this.getRequestAsync(searchValue);
      if (!request || !request.requestId)
        this.request.next({ requestId: searchValue, newSearch: true });
      else {
        request.newSearch = true;
        await this.setRequestWithStatus(request);
      }
    }
  }


  private async setRequestWithStatus(request) {
    this.setRequestStatus(request);
    request.history = await this.getRequestHistory(request.requestId);
    this.request.next(request);
  }


  private setRequestStatus(request) {
    if (request.state == 2)
      request.status = 'cancelled';
    else if (request.state == 1) {
      if (request.balance.lt(request.expectedAmount))
        request.status = 'in progress';
      else if (request.balance.eq(request.expectedAmount))
        request.status = 'complete';
      else if (request.balance.gt(request.expectedAmount))
        request.status = 'overpaid';
      else
        request.status = 'accepted'
    } else {
      request.status = 'created';
    }
  }


  public createRequestAsPayee(payer: string, expectedAmount: string, data: string, callback ? ) {
    if (this.watchDog()) return callback();
    if (!this.web3.utils.isAddress(payer)) return callback({ message: 'payer\'s address is not a valid Ethereum address' });

    console.log('RequestNetworkService createRequestAsPayee');
    let expectedAmountInWei = this.toWei(expectedAmount, 'ether');
    this.requestNetwork.requestEthereumService.createRequestAsPayee(payer, expectedAmountInWei, data).on('broadcasted', response => {
      console.log('callback createRequestAsPayee: ', response);
      callback(response);
    }).then(
      async response => {
        console.log('resolve createRequestAsPayee: ', response);
        response.request.transactionHash = response.transactionHash;
        await this.setRequestWithStatus(response.request);
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
      async response => {
        response.request.transactionHash = response.transactionHash;
        await this.setRequestWithStatus(response.request);
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
      async response => {
        response.request.transactionHash = response.transactionHash;
        await this.setRequestWithStatus(response.request);
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
      async response => {
        response.request.transactionHash = response.transactionHash;
        await this.setRequestWithStatus(response.request);
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
      async response => {
        response.request.transactionHash = response.transactionHash;
        await this.setRequestWithStatus(response.request);
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
      async response => {
        response.request.transactionHash = response.transactionHash;
        await this.setRequestWithStatus(response.request);
      }, err => {
        console.log('Error:', err);
        callback(err);
      });
  }


  public async getRequestAsync(requestId: string) {
    console.log('RequestNetworkService getRequest by id');
    try {
      let request = await this.requestNetwork.requestCoreService.getRequest(requestId);
      this.setRequestStatus(request);
      return request;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async getRequestByTransactionHashAsync(requestId: string) {
    console.log('RequestNetworkService getRequest by txHash');
    try {
      let request = await this.requestNetwork.requestCoreService.getRequestByTransactionHash(requestId);
      this.setRequestStatus(request);
      return request;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


  public async getRequestHistory(requestId: string) {
    console.log('RequestNetworkService getRequestHistory');
    try {
      let history = await this.requestNetwork.requestCoreService.getRequestHistory(requestId);
      return history;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async getRequestsByAddress(requestId: string) {
    console.log('RequestNetworkService getRequestsByAddress');
    try {
      let requests = await this.requestNetwork.requestCoreService.getRequestsByAddress(requestId);
      return requests;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

}
