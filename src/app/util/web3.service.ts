import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { default as contract } from 'truffle-contract';
import { Subject } from 'rxjs/Rx';
import requestEthereumService from 'requestnetwork.js/dist/src/servicesContracts/requestEthereum-service';


declare let window: any;

@Injectable()
export class Web3Service {
  private web3: Web3;
  private requestEthereumService: requestEthereumService;
  private accounts: string[];
  public ready = false;
  public accountsObservable = new Subject < string[] > ();

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');
      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;

      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    this.requestEthereumService = new requestEthereumService(this.web3.givenProvider)
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

  public async foo() {
     console.log(this.requestEthereumService);

    console.log(this.requestEthereumService.createRequestAsPayeeAsync);
    try {
      let result = await this.requestEthereumService.createRequestAsPayeeAsync(
        "0xf17f52151ebef6c7334fad080c5704d77216b732", // 1
        1000,
        /* "", */
        '',
        /* [], */
        ["0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef"], // 2 
        '{"reason":"wine purchased"}');

      console.log("result createRequestAsPayeeAsync********************");
      console.log(result);

      let requestID = result.requestId;
      result = await this.requestEthereumService.getRequestAsync(requestID);
      console.log("result requestEthereumService getRequestAsync********************");
      console.log(result);
    } catch (err) {
      console.log('Error: ', err.message);
    }
  }


}
