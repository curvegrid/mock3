import { ethers } from 'ethers';
class Mock3 {
    provider;
    #signers;
    #accountIndex;
    constructor(rpc) {
        if (!rpc) {
            throw new Error('empty rpc');
        }
        this.provider = new ethers.JsonRpcProvider(rpc);
        this.#signers = {};
        this.#accountIndex = null;
    }
    async getNetwork() {
        return this.provider.getNetwork();
    }
    async getBalance(address, blockTag) {
        return this.provider.getBalance(address, blockTag);
    }
    async getTransactionCount(address, blockTag) {
        return this.provider.getTransactionCount(address, blockTag);
    }
    async getFeeData() {
        return this.provider.getFeeData();
    }
    async broadcastTransaction(signedTx) {
        return this.provider.broadcastTransaction(signedTx);
    }
    async getTransactionReceipt(transactionHash) {
        return this.provider.getTransactionReceipt(transactionHash);
    }
    async getSigner(indexOrAddress) {
        switch (typeof indexOrAddress) {
            case 'string':
                return this.#signers[indexOrAddress];
            case 'number':
                return Object.values(this.#signers)[indexOrAddress];
            default:
                return undefined;
        }
    }
    async listAccounts() {
        const accounts = Object.values(this.#signers).map(signer => signer.address);
        if (this.#accountIndex !== null && this.#accountIndex !== undefined) {
            const found = accounts[this.#accountIndex];
            return found ? [new ethers.JsonRpcSigner(this.provider, found)] : [];
        }
        return accounts.map(account => new ethers.JsonRpcSigner(this.provider, account));
    }
    setSigner(signerPrivateKey) {
        if (Array.isArray(signerPrivateKey)) {
            const created = [];
            signerPrivateKey.forEach(privateKey => {
                const wallet = new ethers.Wallet(privateKey, this.provider);
                this.#signers[wallet.address] = wallet;
                created.push(wallet);
            });
            return created;
        }
        else {
            const created = new ethers.Wallet(signerPrivateKey, this.provider);
            this.#signers[created.address] = created;
            return created;
        }
    }
    setAccountIndex(index) {
        this.#accountIndex = index;
    }
}
export { Mock3, };
//# sourceMappingURL=mock3.js.map