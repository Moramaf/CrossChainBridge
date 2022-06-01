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
let chainId: any;

value = 100; //tokens
chainId = 1;



describe("Staking", function () {
  beforeEach(async function () {
    [owner, addr2, addr3] = await ethers.getSigners();

    Token = await ethers.getContractFactory("TokenERC20");
    token = await Token.deploy(ethers.utils.parseUnits("1000000", 18), "BridgeToken", "BT");
    await token.deployed();

    Bridge = await ethers.getContractFactory("Bridge");
    bridge = await Bridge.deploy(token.address, 1, 57);
    await bridge.deployed();

    await bridge.includeToken(token.address);

    await token.approve(bridge.address, ethers.utils.parseUnits(value, 18));

    await bridge.swap(ethers.utils.parseUnits(value, 18), addr2, chainId);

    msg = ethers.utils.solidityKeccak256(["address", "uint256"], [addr2, value]);
    signature = await owner.signMessage(ethers.utils.arrayify(msg));
    let sig = await ethers.utils.splitSignature(signature);

    //await contract.checkSign(addr, value, sig.v, sig.r, sig.s);

  });

  // it("check stake function", async function () {
  //   await staking.stake(ethers.utils.parseUnits("100", 18))
  //   expect(await staking.totalSupply()).to.equal(ethers.utils.parseUnits("100", 18))
  //   let staker = await staking.balances(owner.address);
  //   expect(await staker.unclaimableBalance).to.equal(ethers.utils.parseUnits("100", 18));
  //   expect(await staker.pendingRewards).to.equal(ethers.utils.parseUnits("20", 18));
  //   expect(await lpToken.balanceOf(staking.address)).to.equal(ethers.utils.parseUnits("100", 18));
    
  // });
  // it("Time to claim require check", async function () {
  //   await expect(staking.claim()).to.be.revertedWith("Reward is not available");
  // });

  // it("checking Claim reward tokens function", async function () {
  //   await staking.stake(ethers.utils.parseUnits("100", 18))
  //   const roundTime = 12 * 60 * 60; //12 minutes
  //   await network.provider.send("evm_increaseTime", [roundTime]);
  //   await network.provider.send("evm_mine");
  //   await staking.claim();
  //   const staker = await staking.balances(owner.address);
  //   expect(await staker.claimableReward).to.equal('0');
  //   expect(await rwToken.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("20", 18));
  // });

  // it("No staked tokens revert checking", async function () {
  //   await expect(staking.unstake(ethers.utils.parseUnits("100", 18))).to.revertedWith("No tokens staked");
  // });

  // it("Time to unstake require check", async function () {
  //   await staking.stake(ethers.utils.parseUnits("100", 18))
  //   await expect(staking.unstake(ethers.utils.parseUnits("70", 18))).to.revertedWith("Lockup time doesn't over");
  // });

  // it("Time to unstake require check", async function () {
  //   await staking.stake(ethers.utils.parseUnits("100", 18))
  //   const roundTime = 22 * 60 * 60; //22 minutes
  //   await network.provider.send("evm_increaseTime", [roundTime]);
  //   await network.provider.send("evm_mine");
  //   await expect(staking.unstake(ethers.utils.parseUnits("150", 18))).to.revertedWith("Don't have enough tokens unstake");
  // });

  // it("Checking Unstake lp tokens function", async function () {
  //     await staking.stake(ethers.utils.parseUnits("100", 18))
  //     const roundTime = 22 * 60 * 60; //22 minutes
  //     await network.provider.send("evm_increaseTime", [roundTime]);
  //     await network.provider.send("evm_mine");
  //     await staking.unstake(ethers.utils.parseUnits("70", 18));
  //     expect(await lpToken.balanceOf(staking.address)).to.equal(ethers.utils.parseUnits("30", 18));
  //     expect(await lpToken.balanceOf(owner.address)).to.equal(ethers.utils.parseUnits("970", 18));
  //     const staker = staking.balances(owner.address);
  // });

  // it("checking change of reward time", async function () {
  //   await staking.changeRewardTime(30);
  //   expect(await staking.rewardTime()).to.equal(30);
  // });

  // it("checking change of lock up tokens time", async function () {
  //   await staking.changeLockUpTime(30);
  //   expect(await staking.lockUpTime()).to.equal(30);
  // });

  // it("checking change of reward rate", async function () {
  //   await staking.changeRewardRate(50);
  //   expect(await staking.rewardRate()).to.equal(50);
  // });

});