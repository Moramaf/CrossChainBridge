import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { bridgeEthAddress } from "../config";

task("swap", "transfer token to BSC")
.addOptionalParam("amount", "amount of token to transfer. Approve amont before")
.addOptionalParam("to", "address of reciepient")
.setAction(async (taskArgs, hre) => {
    const Bridge = await hre.ethers.getContractAt("Bridge", bridgeEthAddress);
    const tx = await Bridge.swap(taskArgs.amount, taskArgs.to);
    await tx.wait();
    console.log(`${taskArgs.amount} tokens transfered to ${taskArgs.to}`);
});