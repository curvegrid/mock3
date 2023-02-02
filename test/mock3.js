'use strict';

const { expect, assert } = require('chai');
const { Wallet } = require('ethers');
const { Mock3 } = require('../dist/index.js');

const signers = [
  {
    ADDRESS: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    PRIVATE_KEY: '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
  },
  {
    ADDRESS: '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0',
    PRIVATE_KEY: '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1',
  },
  {
    ADDRESS: '0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b',
    PRIVATE_KEY: '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c',
  },
];

const getAccounts = () => {
  return signers.map(signer => signer.ADDRESS);
}

const getPrivateKeys = () => {
  return signers.map(signer => signer.PRIVATE_KEY);
}

let web3;
beforeEach(() => {
  web3 = new Mock3('http://127.0.0.1:9545');
});

describe('Mock3 initialization', () => {
  it('should return Goerli network as default', async () => {
    const expectedResult = {
      name: 'goerli',
      chainId: 5,
      ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    }
    const web3Default = new Mock3();
    const actualResult = await web3Default.getNetwork();
    delete actualResult._defaultProvider;
    expect(actualResult).eql(expectedResult);
  });

  it('should return custom JSON RPC of passing a RPC URL (Polygon Mumbai)', async () => {
    // Use Polygon Mumbai testnet's public RPC URL
    const web3RPC = new Mock3("https://rpc-mumbai.maticvigil.com");
    const expectedResult = {
      name: 'maticmum',
      chainId: 80001,
      ensAddress: null,
    }
    const actualResult = await web3RPC.getNetwork();
    delete actualResult._defaultProvider;
    expect(actualResult).eql(expectedResult);
  });
});

describe('Mock3 signer', () => {
  it('can set an account with a private key', () => {
    const { signingKey: expectedResult } = new Wallet(signers[0].PRIVATE_KEY)
    const { signingKey: actualResult } = web3.setSigner(signers[0].PRIVATE_KEY);
    expect(actualResult).eql(expectedResult);
  });

  it('can set accounts with multiple private keys', () => {
    const expectedResult = [];
    const actualResult = [];
    signers.forEach((signer) => {
      const { signingKey: expected } = new Wallet(signer.PRIVATE_KEY)
      expectedResult.push(expected);
    });

    const actualSigners = web3.setSigner(getPrivateKeys());
    actualSigners.forEach((actualSigner) => {
      actualResult.push(actualSigner.signingKey);
    });
    expect(actualResult).eql(expectedResult);
  });

  it('should not add a new singer with the same private key', async () => {
    const expectedLength = 1;
    web3.setSigner(signers[0].PRIVATE_KEY);
    const actualResult1 = await web3.listAccounts();
    expect(actualResult1.length).eql(expectedLength);

    web3.setSigner(signers[0].PRIVATE_KEY);
    const actualResult2 = await web3.listAccounts();
    expect(actualResult2.length).eql(expectedLength);
  });

  it('should return a signer by index, address', async () => {
    web3.setSigner(getPrivateKeys());

    const indexValid = 0;
    const result1 = web3.getSigner(indexValid);
    expect(result1.address).eql(signers[0].ADDRESS);

    const keyValid = '0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0';
    const result2 = web3.getSigner(keyValid);
    expect(result2.address).eql(keyValid);

    const indexInvalid = 999;
    const result3 = web3.getSigner(indexInvalid);
    assert.isUndefined(result3);

    const keyInvalid = '0xFFcf8FDEE72ac11b5c542428B35EEF576INVALID';
    const result4 = web3.getSigner(keyInvalid);
    assert.isUndefined(result4);
  });

  it('should return all accounts', async () => {
    const result1 = await web3.listAccounts();
    expect(result1.length).eql(0);

    web3.setSigner(getPrivateKeys());

    const result2 = await web3.listAccounts();
    expect(result2.length).eql(signers.length);
    expect(result2).eql(getAccounts());
  });

  it('should return an only specific account of the index after account index is set', async () => {
    web3.setSigner(getPrivateKeys());

    // unset account index
    const result1 = await web3.listAccounts();
    expect(result1.length).eql(signers.length);
    expect(result1).eql(getAccounts());

    // set account index to null
    web3.setAccountIndex(null);
    const result2 = await web3.listAccounts();
    expect(result2.length).eql(signers.length);
    expect(result2).eql(getAccounts());

    const indexValid = 2;
    web3.setAccountIndex(indexValid);
    const result3 = await web3.listAccounts();
    expect(result3.length).eql(1);
    expect(result3).eql([signers[indexValid].ADDRESS]);

    // set account index to the out of range
    web3.setAccountIndex(-1);
    const result4 = await web3.listAccounts();
    expect(result4.length).eql(0);
    expect([]).eql([]);

    // set account index to the out of range
    web3.setAccountIndex(999);
    const result5 = await web3.listAccounts();
    expect(result5.length).eql(0);
    expect([]).eql([]);
  });

  it('should return tx receipt', async () => {
    web3.setSigner(getPrivateKeys());

    const signer = web3.getSigner(0);
    const balanceBefore = await signer.getBalance();
    const tx = await signer.sendTransaction({
      to: signer.address,
      value: 1,
    });

    await new Promise((resolve) => {
      web3.provider.once(tx.hash, async (receipt) => {
        const balanceAfter = await signer.getBalance();
        expect(receipt.transactionHash).eql(tx.hash);
        assert.isTrue(balanceBefore.gte(balanceAfter));
        resolve();
      });
    });
  });
});
