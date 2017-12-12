import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import Web3 from 'web3';
import RequestNetwork from 'requestnetwork.js/dist/src/requestNetwork';

declare let window: any;

@Injectable()
export class Web3Service {
  private web3: Web3;
  public requestNetwork: RequestNetwork;
  public accounts: string[];
  public metamaskReady = new Subject < boolean > ();
  public requestNetworkReady = new Subject < boolean > ();
  public accountsObservable = new Subject < string[] > ();
  public searchValue = new Subject < string > ();
  public request = new Subject < any > ();

  constructor() {
    window.addEventListener('load', event => {
      console.log('web3service instantiate web3');
      this.checkAndInstantiateWeb3();
      this.web3.eth.net.getId().
      then(networkId => {
        this.requestNetwork = new RequestNetwork(this.web3.givenProvider, networkId)
        this.requestNetworkReady.next(true);
      }, err => {
        console.error(err);
        this.requestNetworkReady.next(false);
      });
    });
  }


  private checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.log('Using web3 detected from external source. If you find that your accounts don\'t appear, ensure you\'ve configured that source properly.');
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
      if (err != null || accs.length == 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        this.metamaskReady.next(false);
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');
        this.accountsObservable.next(accs);
        this.accounts = accs;
        this.metamaskReady.next(true);
      }
    });
  }


  public setSearchValue(searchValue: string) {
    this.searchValue.next(searchValue);
  }


  public createRequestAsPayee(payer: string, expectedAmount: number, data: string, callback ? ) {
    console.log('RequestNetworkService createRequestAsPayee');
    let expectedAmountInWei = this.web3.utils.toWei(expectedAmount.toString(), 'ether');
    this.requestNetwork.requestEthereumService.createRequestAsPayee(payer, expectedAmountInWei, data).on('broadcasted', response => {
        console.log('callback createRequestAsPayee: ', response);
        callback(response);
      })
      .then(response => {
        console.log('resolve createRequestAsPayee: ', response);
        response.request.transactionHash = response.transactionHash;
        this.request.next(this.convertRequestAmountsFromWei(response.request));
      }, err => {
        console.error(err);
        callback(err);
      });
  }


  public cancel(requestId: string, callback ? ) {
    console.log('RequestNetworkService cancel');
    this.requestNetwork.requestEthereumService.cancel(requestId).on('broadcasted', response => {
        callback(response);
      })
      .then(response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(this.convertRequestAmountsFromWei(response.request));
      }, err => {
        console.error(err);
        callback(err);
      });
  }


  public accept(requestId: string, callback ? ) {
    console.log('RequestNetworkService accept');
    this.requestNetwork.requestEthereumService.accept(requestId).on('broadcasted', response => {
        callback(response);
      })
      .then(response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(this.convertRequestAmountsFromWei(response.request));
      }, err => {
        console.error(err);
        callback(err);
      });
  }


  public subtractAction(requestId: string, amount: number, callback ? ) {
    console.log('RequestNetworkService subtractAction');
    let amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
    this.requestNetwork.requestEthereumService.subtractAction(requestId, amountInWei).on('broadcasted', response => {
        callback(response);
      })
      .then(response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(this.convertRequestAmountsFromWei(response.request));
      }, err => {
        console.error(err);
        callback(err);
      });
  }


  public additionalAction(requestId: string, amount: number, callback ? ) {
    console.log('RequestNetworkService additionalAction');
    let amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
    this.requestNetwork.requestEthereumService.additionalAction(requestId, amountInWei).on('broadcasted', response => {
        callback(response);
      })
      .then(response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(this.convertRequestAmountsFromWei(response.request));
      }, err => {
        console.error(err);
        callback(err);
      });
  }


  public paymentAction(requestId: string, amount: number, callback ? ) {
    console.log('RequestNetworkService pay');
    let amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
    this.requestNetwork.requestEthereumService.paymentAction(requestId, amountInWei, 0).on('broadcasted', response => {
        callback(response);
      })
      .then(response => {
        response.request.transactionHash = response.transactionHash;
        this.request.next(this.convertRequestAmountsFromWei(response.request));
      }, err => {
        console.error(err);
        callback(err);
      });
  }


  public async getRequestAsync(requestId: string) {
    try {
      console.log('RequestNetworkService getRequest by id');
      let result = await this.requestNetwork.requestCoreService.getRequest(requestId);
      console.log('getRequest by id result: ', result);
      return this.convertRequestAmountsFromWei(result)
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


  public async getRequestByTransactionHashAsync(requestId: string) {
    try {
      console.log('RequestNetworkService getRequest by txHash');
      let result = await this.requestNetwork.requestCoreService.getRequestByTransactionHash(requestId);
      console.log('getRequest by txHash result: ', result);
      return this.convertRequestAmountsFromWei(result)
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


  public async getRequestHistory(requestId: string) {
    try {
      console.log('RequestNetworkService getRequestHistory');
      let result = await this.requestNetwork.requestEthereumService.getRequestHistory(requestId);
      console.log('getRequestHistory result: ', result);
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }


  private convertRequestAmountsFromWei(request: any) {
    const fromWei = this.web3.utils.fromWei;

    // var DECIMAL_REQ = this.web3.utils.(10).pow(18);


    // if (request.expectedAmount)
    //   request.expectedAmount = fromWei(request.expectedAmount.toString(), 'ether');
    // if (request.balance)
    //   request.balance = fromWei(request.balance.toString(), 'ether');
    // return request;
  }

}
