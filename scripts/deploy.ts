import { ethers } from "hardhat";
import { tokenAddress, chainIDeth, chainIDbsc } from "../config";


async function main() {

  const Bridge = await ethers.getContractFactory("bridge");
  const bridge = await Bridge.deploy(tokenAddress, chainIDeth, chainIDbsc);

  await bridge.deployed();

  console.log("Bridge deployed to:", bridge.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
