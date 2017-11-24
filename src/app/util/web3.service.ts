import { Injectable, HostListener } from '@angular/core';
import Web3 from 'web3';
import { default as contract } from 'truffle-contract';
import { Subject } from 'rxjs/Rx';
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
      this.checkAndInstantiateWeb3();
      this.requestNetwork = new RequestNetwork(this.web3.currentProvider)
    });
  }

  public checkAndInstantiateWeb3() {
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

  //
  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;
  }
  //


  public async createRequestAsPayeeAsync(payerAddress, amountInitial, reason) {
      return await this.requestNetwork.requestEthereumService.createRequestAsPayeeAsync(payerAddress, amountInitial, '', [''], `{"reason": "${reason}"}`);
  }

  public async createRequestAsPayeeAsync2(payerAddress, amountInitial, reason) {
    try {
      let result = await this.requestNetwork.requestEthereumService.createRequestAsPayeeAsync(payerAddress, amountInitial, '', [''], `{"reason": "${reason}"}`);

      console.log('result createRequestAsPayeeAsync********************');
      console.log(result);

      let requestID = result.requestId;
      result = await this.requestNetwork.requestEthereumService.getRequestAsync(requestID);
      console.log('result requestNetworkService getRequestAsync********************');
      console.log(result);
      return result;
    } catch (err) {
      console.log('Error: ', err.message);
    }
  }


}
