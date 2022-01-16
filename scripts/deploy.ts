import { ethers } from "hardhat";

async function main() {
  const Figurita = await ethers.getContractFactory("Figurita");
  const figurita = await Figurita.deploy();
  await figurita.deployed();
  console.log("Figurita deployed to:", figurita.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })