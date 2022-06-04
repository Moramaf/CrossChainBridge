import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";

let Token;
let token: Contract;
let Bridge;
let bridge: Contract;
let owner: SignerWithAddress;
let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;
let signature: string;
let msg: string;
let addr: SignerWithAddress;
let value: any;
let chainId1: any;
let chainId2: any;
let totalSupply: any;

value = 1000; //tokens to transfer
chainId1 = 1;
chainId2 = 57;
totalSupply = 1000000; //tokens



describe("Staking", function () {
  beforeEach(async function () {
    [owner, addr2, addr3] = await ethers.getSigners();

    Token = await ethers.getContractFactory("TokenERC20");
    token = await Token.deploy(ethers.utils.parseUnits(`${totalSupply}`, 18), "BridgeToken", "BT");
    await token.deployed();

    Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy(token.address, chainId1, chainId2);
    await bridge.deployed();

    await token.approve(bridge.address, ethers.utils.parseUnits(`${value}`, 18));

  });

  it("check swap and burn", async function () {
    await bridge.swap(ethers.utils.parseUnits(`${value}`, 18), addr2.address);
    expect(await token.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits(`${totalSupply - value}`, 18));
    expect(await token.totalSupply()).to.equal(ethers.utils.parseUnits(`${totalSupply - value}`, 18));
    //event check
  });

  it("Redeem check, msg not for this chain", async function () {
    msg = ethers.utils.solidityKeccak256(["address", "uint256", "uint256"], [addr2.address, ethers.utils.parseUnits(`${value}`, 18), 0]);
    signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);

    await expect(bridge.redeem(addr2.address, value, chainId2, 0, sig.v, sig.r, sig.s)).to.be.revertedWith('chain is not correct');
  });

  it("Redeem check, validator check", async function () {
    msg = ethers.utils.solidityKeccak256(["address", "uint256", "uint256"], [addr2.address, ethers.utils.parseUnits(`${value}`, 18), 0]);
    signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);
    await bridge.redeem(addr2.address, ethers.utils.parseUnits(`${value}`), chainId1, 0, sig.v, sig.r, sig.s);
  });

  it("Redeem check, wrong sign revert check", async function () {
    msg = ethers.utils.solidityKeccak256(["address", "uint256", "uint256"], [addr2.address, ethers.utils.parseUnits(`${value}`, 18), 0]);
    signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);
    await expect(bridge.redeem(addr2.address, ethers.utils.parseUnits(`${value}`), chainId1, 1, sig.v, sig.r, sig.s)).to.be.revertedWith('sign does not correct!');
  });

  it("Redeem check, validator check", async function () {
    msg = ethers.utils.solidityKeccak256(["address", "uint256", "uint256"], [addr2.address, ethers.utils.parseUnits(`${value}`, 18), 0]);
    signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);
    await bridge.redeem(addr2.address, ethers.utils.parseUnits(`${value}`), chainId1, 0, sig.v, sig.r, sig.s);
    await expect(bridge.redeem(addr2.address, ethers.utils.parseUnits(`${value}`), chainId1, 0, sig.v, sig.r, sig.s)).to.be.revertedWith('transfer already processed');
  });

});