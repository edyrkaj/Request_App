import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material';

import Web3 from 'web3';
import RequestNetwork from '@requestnetwork/request-network.js/dist/src/requestNetwork';

/* beautify preserve:start */
declare let window: any;
/* beautify preserve:end */

@Injectable()
export class Web3Service {
  private web3: Web3;
  private requestNetwork: RequestNetwork;
  private infuraNodeUrl = 'https://rinkeby.infura.io/BQBjfSi5EKSCQQpXebO';
  private metamaskConnected = true;


  public etherscanUrl: string;
  public accounts: string[];
  public ready = false;

  public accountsObservable = new Subject < string[] > ();
  public searchValue = new Subject < string > ();

  public fromWei;
  public toWei;
  public BN;
  public isAddress;

  web3NotReadyMsg = 'Error when trying to instanciate web3.';
  requestNetworkNotReadyMsg = 'Request Network smart contracts are not deployed on this network. Please use Rinkeby Test Network.';
  metamaskNotReadyMsg = 'Connect your Metamask wallet to create or interact with a Request.';


  constructor(public snackBar: MatSnackBar) {
    window.addEventListener('load', event => {
      console.log('web3service instantiate web3');
      this.checkAndInstantiateWeb3();
    });
  }


  private checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.log(`Using web3 detected from external source. If you find that your accounts don\'t
         appear, ensure you\'ve configured that source properly.`);
      this.web3 = new Web3(window.web3.currentProvider);

      // Start requestnetwork Library
      this.web3.eth.net.getId().then(
        networkId => {
          try {
            this.setEtherscanUrl(networkId);
            this.requestNetwork = new RequestNetwork(this.web3.givenProvider, networkId);
            this.ready = true;
          } catch (err) {
            if (this.web3) { this.openSnackBar(this.requestNetworkNotReadyMsg); }
            console.log('Error: ', err.message);
          }
        }, err => {
          console.error('Error:', err);
        });
    } else {
      console.warn(`No web3 detected. Falling back to ${this.infuraNodeUrl}.`);
      this.web3 = new Web3(new Web3.providers.HttpProvider(this.infuraNodeUrl));
      this.requestNetwork = new RequestNetwork(this.web3.givenProvider, 4);
      this.ready = true;
    }

    this.fromWei = this.web3.utils.fromWei;
    this.toWei = this.web3.utils.toWei;
    this.isAddress = this.web3.utils.isAddress;
    this.BN = mixed => new this.web3.utils.BN(mixed);

    setInterval(_ => this.refreshAccounts(), 1000);
  }


  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null || accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        if (this.requestNetwork && this.metamaskConnected) {
          this.metamaskConnected = false;
          this.openSnackBar(this.metamaskNotReadyMsg);
        }
        this.accounts = accs;
        return this.accountsObservable.next(accs);
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');
        this.accountsObservable.next(accs);
        this.accounts = accs;
        if (accs.length) { this.metamaskConnected = true; }
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
    const stop = !this.web3 || !this.requestNetwork || !this.metamaskConnected;
    if (stop) { this.openSnackBar(); }
    return stop;
  }


  /* beautify preserve:start */
  public openSnackBar(msg ?: string, ok ?: string, panelClass ?: string, duration ?: number) {
  /* beautify preserve:end */
    if (!msg) {
      msg = !this.web3 ? this.web3NotReadyMsg : !this.requestNetwork ? this.requestNetworkNotReadyMsg : !this.metamaskConnected ? this.metamaskNotReadyMsg : '';
      if (msg === '') { return; }
    }

    this.snackBar.open(msg, ok || 'Ok', {
      duration: duration || 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: panelClass || 'warning-snackbar',
    });
  }


  public setSearchValue(searchValue: string) {
    this.searchValue.next(searchValue);
  }

  public setRequestStatus(request) {
    if (request.state === 2) {
      request.status = 'cancelled';
    } else if (request.state === 1) {
      if (request.balance.isZero()) {
        request.status = 'accepted';
      } else if (request.balance.lt(request.expectedAmount)) {
        request.status = 'in progress';
      } else if (request.balance.eq(request.expectedAmount)) {
        request.status = 'complete';
      } else if (request.balance.gt(request.expectedAmount)) {
        request.status = 'overpaid';
      }
    } else {
      request.status = 'created';
    }
  }


  public createRequestAsPayee(payer: string, expectedAmount: string, data: string, callback ? ) {
    if (this.watchDog()) { return callback(); }
    if (!this.web3.utils.isAddress(payer)) { return callback({ message: 'payer\'s address is not a valid Ethereum address' }); }
    const expectedAmountInWei = this.toWei(expectedAmount, 'ether');
    return this.requestNetwork.requestEthereumService.createRequestAsPayee(payer, expectedAmountInWei, data);
  }


  public cancel(requestId: string, callback ? ) {
    if (this.watchDog()) { return callback(); }
    return this.requestNetwork.requestEthereumService.cancel(requestId);
  }


  public accept(requestId: string, callback ? ) {
    if (this.watchDog()) { return callback(); }
    return this.requestNetwork.requestEthereumService.accept(requestId);
  }


  public subtractAction(requestId: string, amount: string, callback ? ) {
    if (this.watchDog()) { return callback(); }
    const amountInWei = this.toWei(amount.toString(), 'ether');
    return this.requestNetwork.requestEthereumService.subtractAction(requestId, amountInWei);
  }


  public additionalAction(requestId: string, amount: string, callback ? ) {
    if (this.watchDog()) { return callback(); }
    const amountInWei = this.toWei(amount.toString(), 'ether');
    return this.requestNetwork.requestEthereumService.additionalAction(requestId, amountInWei);
  }


  public paymentAction(requestId: string, amount: string, callback ? ) {
    if (this.watchDog()) { return callback(); }
    const amountInWei = this.toWei(amount.toString(), 'ether');
    return this.requestNetwork.requestEthereumService.paymentAction(requestId, amountInWei, 0);
  }

  public refundAction(requestId: string, amount: string, callback ? ) {
    if (this.watchDog()) { return callback(); }
    const amountInWei = this.toWei(amount.toString(), 'ether');
    return this.requestNetwork.requestEthereumService.refundAction(requestId, amountInWei, 0);
  }


  public async getRequestByRequestIdAsync(requestId: string) {
    try {
      const request = await this.requestNetwork.requestCoreService.getRequest(requestId);
      this.setRequestStatus(request);
      return request;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async getRequestByTransactionHash(txHash: string) {
    try {
      const response = await this.requestNetwork.requestCoreService.getRequestByTransactionHash(txHash);
      return response;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


  public async getRequestEvents(requestId: string) {
    try {
      const history = await this.requestNetwork.requestCoreService.getRequestEvents(requestId);
      return history.sort((a, b) => b._meta.timestamp - a._meta.timestamp);
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async getRequestsByAddress(requestId: string) {
    try {
      const requests = await this.requestNetwork.requestCoreService.getRequestsByAddress(requestId);
      return requests;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

}
