import { ethers } from 'ethers';
declare class Mock3 {
    #private;
    provider: ethers.JsonRpcProvider;
    constructor(rpc?: string);
    getNetwork(): Promise<ethers.Network>;
    getBalance(address: ethers.AddressLike, blockTag?: ethers.BlockTag): Promise<bigint>;
    getTransactionCount(address: ethers.AddressLike, blockTag?: ethers.BlockTag): Promise<number>;
    getFeeData(): Promise<ethers.FeeData>;
    broadcastTransaction(signedTx: string): Promise<ethers.TransactionResponse>;
    getTransactionReceipt(transactionHash: string): Promise<ethers.TransactionReceipt | null>;
    getSigner(indexOrAddress?: number | string): Promise<ethers.Wallet | undefined>;
    listAccounts(): Promise<ethers.JsonRpcSigner[]>;
    setSigner(signerPrivateKey: string | string[]): ethers.Wallet | ethers.Wallet[];
    setAccountIndex(index: number | null): void;
}
export { Mock3, };
//# sourceMappingURL=mock3.d.ts.map