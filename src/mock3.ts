import { ethers } from 'ethers';

interface SignerCache {
  [key: string]: ethers.Wallet;
}

class Mock3 {
  provider: ethers.JsonRpcProvider;

  #signers: SignerCache;
  #accountIndex: number | null;

  constructor(rpc?: string) {
    if (!rpc) {
      throw new Error('empty rpc');
    }

    this.provider = new ethers.JsonRpcProvider(rpc);
    this.#signers = {};
    this.#accountIndex = null;
  }

  async getNetwork(): Promise<ethers.Network> {
    return this.provider.getNetwork();
  }

  async getBalance(address: ethers.AddressLike, blockTag?: ethers.BlockTag): Promise<bigint> {
    return this.provider.getBalance(address, blockTag);
  }

  async getTransactionCount(address: ethers.AddressLike, blockTag?: ethers.BlockTag)
    :Promise<number> {
    return this.provider.getTransactionCount(address, blockTag);
  }

  async getFeeData(): Promise<ethers.FeeData> {
    return this.provider.getFeeData();
  }

  async broadcastTransaction(signedTx: string): Promise<ethers.TransactionResponse> {
    return this.provider.broadcastTransaction(signedTx);
  }

  async getTransactionReceipt(transactionHash: string)
    :Promise<ethers.TransactionReceipt | null> {
    return this.provider.getTransactionReceipt(transactionHash);
  }

  // Custom functions to work for signing transaction without user side action

  async getSigner(indexOrAddress?: number | string): Promise<ethers.Wallet | undefined> {
    switch (typeof indexOrAddress) {
      case 'string':
        return this.#signers[indexOrAddress];
      case 'number':
        return Object.values(this.#signers)[indexOrAddress];
      default:
        return undefined;
    }
  }

  async listAccounts(): Promise<ethers.JsonRpcSigner[]> {
    const accounts: string[] = Object.values(this.#signers).map(signer => signer.address)

    if (this.#accountIndex !== null && this.#accountIndex !== undefined) {
      const found = accounts[this.#accountIndex];
      return found ? [new ethers.JsonRpcSigner(this.provider,found)] : [];
    }

    return accounts.map(account => new ethers.JsonRpcSigner(this.provider, account));
  }

  setSigner(signerPrivateKey: string | string[]): ethers.Wallet | ethers.Wallet[] {
    if (Array.isArray(signerPrivateKey)) {
      const created: ethers.Wallet[] = [];
      signerPrivateKey.forEach(privateKey => {
        const wallet: ethers.Wallet = new ethers.Wallet(privateKey, this.provider);
        this.#signers[wallet.address] = wallet;
        created.push(wallet);
      });
      return created;
    } else  {
      const created: ethers.Wallet = new ethers.Wallet(signerPrivateKey, this.provider);
      this.#signers[created.address] = created;
      return created;
    }
  }

  setAccountIndex(index: number | null): void {
    this.#accountIndex = index;
  }
}

export {
  Mock3,
};
