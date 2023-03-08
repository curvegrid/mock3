import { ethers } from 'ethers';

interface SignerCache {
  [key: string]: ethers.Wallet;
}

class Mock3 {
  private readonly provider: ethers.JsonRpcProvider;
  private signers: SignerCache;
  private accountIndex: number | null;

  constructor(rpc?: string) {
    if (!rpc) {
      throw new Error('empty rpc');
    }

    this.provider = new ethers.JsonRpcProvider(rpc);
    this.signers = {};
    this.accountIndex = null;
  }

  async getNetwork(): Promise<ethers.Network> {
    return await this.provider.getNetwork();
  }

  async getBalance(address: ethers.AddressLike, blockTag?: ethers.BlockTag): Promise<bigint> {
    return await this.provider.getBalance(address, blockTag);
  }

  async getSigner(indexOrAddress?: number | string): Promise<ethers.Wallet | undefined> {
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

    if (this.accountIndex !== null && this.accountIndex !== undefined) {
      const found = accounts[this.accountIndex];
      return found ? Promise.resolve([found]) : Promise.resolve([]);
    }

    return Promise.resolve(accounts);
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
