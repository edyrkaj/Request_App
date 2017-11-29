import { Injectable, HostListener } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import Web3 from 'web3';
import RequestNetwork from 'requestnetwork.js/dist/src/requestNetwork';

declare let window: any;

@Injectable()
export class Web3Service {
  private web3: Web3;
  private requestNetwork: RequestNetwork;
  private accounts: string[];
  public ready = false;
  public accountsObservable = new Subject < string[] > ();

  constructor() {
    window.addEventListener('load', (event) => {
      console.log('web3service instantiate web3');
      this.checkAndInstantiateWeb3();
      this.requestNetwork = new RequestNetwork(this.web3.currentProvider)
    });
  }

  private checkAndInstantiateWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      console.warn(
        'Using web3 detected from external source. If you find that your accounts don\'t appear, ensure you\'ve configured that source properly.'
      );
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');
      console.warn(
        'No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it\'s inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask'
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    setInterval(() => this.refreshAccounts(), 100);
  }

  private refreshAccounts() {
    console.log('Refreshing accounts');
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        alert('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');
        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }

  public async createRequestAsPayeeAsync(payerAddress, amountInitial, details) {
    try {
    console.log('createRequestAsPayeeAsync');
    let amountInitialInWei = this.web3.utils.toWei(amountInitial.toString(), 'ether');
    return await this.requestNetwork.requestEthereumService.createRequestAsPayeeAsync(payerAddress, amountInitialInWei, details);
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  public async getRequestAsync(requestId) {
    try {
      console.log('result requestNetworkService getRequestAsync');
      let result = await this.requestNetwork.requestEthereumService.getRequestAsync(requestId);
      return this.convertRequestAmountsFromWei(result)
    } catch (err) {
      console.log('Error: ', err.message);
      return err;
    }
  }

  convertRequestAmountsFromWei(request) {
    const toBN = this.web3.utils.toBN;
    const fromWei = this.web3.utils.fromWei;
    if (request.amountInitial)
      request.amountInitial = fromWei(toBN(request.amountInitial), 'ether');
    if (request.amountPaid)
      request.amountPaid = fromWei(toBN(request.amountPaid), 'ether');
    if (request.amountAdditional)
      request.amountAdditional = fromWei(toBN(request.amountAdditional), 'ether');
    if (request.amountSubtract)
      request.amountSubtract = fromWei(toBN(request.amountSubtract), 'ether');
    return request;
  }

}
