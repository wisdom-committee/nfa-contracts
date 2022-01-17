const { utils } = require("ethers");

async function main() {
  const baseTokenURI = "ipfs://QmQ3YTW4NfRc8trvpBsP4NiDZ6s6jPiZaWBnuzQTg6hYru/";

  // Get owner/deployer's wallet address
  const [owner] = await hre.ethers.getSigners();

  // Get contract that we want to deploy
  const contractFactory = await hre.ethers.getContractFactory("Sticker");

  // Deploy contract with the correct constructor arguments
  const contract = await contractFactory.deploy(baseTokenURI);

  // Wait for this transaction to be mined
  await contract.deployed();

  // Get contract address
  console.log("Contract deployed to:", contract.address);

  // Mint 3 NFTs by sending 0.03 ether
  let txn = await contract.mintStickers(10, { value: utils.parseEther('0.01') });
  await txn.wait()

  // Get all token IDs of the owner
  let tokens = await contract.getStickers(owner.address)
  console.log("Owner has tokens: ", tokens);

  // Get tokenURI for sticker 9
  for (let i = 0; i < 10; i++) {
    let uri = await contract.tokenURI(i);
    console.log("Sticker", i, "has URI:", uri);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
