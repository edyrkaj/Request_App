import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import Web3 from 'web3';
import RequestNetwork from 'requestnetwork.js/dist/src/requestNetwork';

declare let window: any;

@Injectable()
export class Web3Service {
  private web3: Web3;
  private requestNetwork: RequestNetwork;
  public accounts: string[];
  public ready: boolean = false;
  public metamaskReady = new Subject < boolean > ();
  public accountsObservable = new Subject < string[] > ();
  public searchValue = new Subject < string > ();
  public request = new Subject < any > ();

  constructor() {
    window.addEventListener('load', event => {
      console.log('web3service instantiate web3');
      this.checkAndInstantiateWeb3();
      this.web3.eth.net.getId().then(networkId => {
        this.requestNetwork = new RequestNetwork(this.web3.givenProvider, networkId)
      });
    });
  }

  private checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn('Using web3 detected from external source. If you find that your accounts don\'t appear, ensure you\'ve configured that source properly.');
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');
      console.warn('No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask');
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    setInterval(() => this.refreshAccounts(), 500);
  }

  private refreshAccounts() {
    console.log('Refreshing accounts');
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null || accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        this.ready = false;
        return this.metamaskReady.next(false);
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');
        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
      this.metamaskReady.next(true);
    });
  }

  public setSearchValue(searchValue: string) {
    this.searchValue.next(searchValue);
  }

  public createRequestAsPayee(payer: string, amountExpected: number, data: string, callback ? ) {
    console.log('RequestNetworkService createRequestAsPayee');
    let amountExpectedInWei = this.web3.utils.toWei(amountExpected.toString(), 'ether');

    this.requestNetwork.requestEthereumService.createRequestAsPayee(payer, amountExpectedInWei, data).on('broadcasted', response => {
        callback(response);
      })
      .then(response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(response.request);
      }, err => {
        console.log(err);
        callback(err);
      });

  }

  public async getRequest(requestId: string) {
    try {
      console.log('RequestNetworkService getRequest');
      let result = await this.requestNetwork.requestEthereumService.getRequest(requestId);
      return this.convertRequestAmountsFromWei(result)
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async accept(requestId: string) {
    try {
      console.log('RequestNetworkService accept');
      let resultAccept = await this.requestNetwork.requestEthereumService.accept(requestId);
      return resultAccept;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async paymentAction(requestId: string, amount: number, additionals ? : number) {
    try {
      console.log('RequestNetworkService pay');
      let amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
      let resultPay = await this.requestNetwork.requestEthereumService.paymentAction(requestId, amountInWei, 0);
      return resultPay;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async cancel(requestId: string) {
    try {
      console.log('RequestNetworkService cancel');
      let resultCancel = await this.requestNetwork.requestEthereumService.cancel(requestId)
      return resultCancel;
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  private convertRequestAmountsFromWei(request: any) {
    const toBN = this.web3.utils.toBN;
    const fromWei = this.web3.utils.fromWei;
    if (request.expectedAmount)
      request.expectedAmount = fromWei(toBN(request.expectedAmount), 'ether');
    if (request.balance)
      request.balance = fromWei(toBN(request.balance), 'ether');
    return request;
  }

}
