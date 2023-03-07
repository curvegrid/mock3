import { ethers } from 'ethers';
import { isNullOrUndefined } from 'util';

interface SignerCache {
  [key: string]: ethers.Wallet;
}

class Mock3 {
  private readonly provider: ethers.JsonRpcProvider;
  private signers: SignerCache;
  private accountIndex: number | null;

  constructor(rpc?: string) {
    if (!rpc) {
      throw new Error('empty or invalid rpc');
    }

    this.provider = new ethers.JsonRpcProvider(rpc);
    this.signers = {};
    this.accountIndex = null;
  }

  async getNetwork(): Promise<ethers.Network> {
    return await this.provider.getNetwork();
  }

  getSigner(indexOrAddress?: number | string): ethers.Wallet | undefined {
    switch (typeof indexOrAddress) {
      case 'string':
        return this.signers[indexOrAddress];
      case 'number':
        return Object.values(this.signers)[indexOrAddress];
      default:
        return undefined;
    }
  }

  async listAccounts(): Promise<string[]> {
    const accounts: string[] = Object.values(this.signers).map(signer => signer.address)

    if (!isNullOrUndefined(this.accountIndex)) {
      const found = accounts[this.accountIndex];
      return found ? Promise.resolve([found]) : Promise.resolve([]);
    }

    return Promise.resolve(accounts);
  }

  async send(method: string, params: any[] | Record<string, any>): Promise<any> {
    if (method === 'eth_accounts') {
      return this.listAccounts();
    }
    return this.provider.send(method, params);
  }

  async getTransactionReceipt(transactionHash: string)
    :Promise<ethers.TransactionReceipt | null> {
    return this.provider.getTransactionReceipt(transactionHash);
  }

  setSigner(signerPrivateKey: string | string[]): ethers.Wallet | ethers.Wallet[] {
    if (Array.isArray(signerPrivateKey)) {
      const created: ethers.Wallet[] = [];
      signerPrivateKey.forEach(privateKey => {
        const wallet: ethers.Wallet = new ethers.Wallet(privateKey, this.provider);
        this.signers[wallet.address] = wallet;
        created.push(wallet);
      });
      return created;
    } else  {
      const created: ethers.Wallet = new ethers.Wallet(signerPrivateKey, this.provider);
      this.signers[created.address] = created;
      return created;
    }
  }

  setAccountIndex(index: number | null): void {
    this.accountIndex = index;
  }
}

export {
  Mock3,
};
