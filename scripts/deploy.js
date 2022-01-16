const { utils } = require("ethers");

async function main() {
  const baseTokenURI = "ipfs://QmQ3YTW4NfRc8trvpBsP4NiDZ6s6jPiZaWBnuzQTg6hYru/";

  // Get owner/deployer's wallet address
  const [owner] = await hre.ethers.getSigners();

  // Get contract that we want to deploy
  const contractFactory = await hre.ethers.getContractFactory("Figurita");

  // Deploy contract with the correct constructor arguments
  const contract = await contractFactory.deploy(baseTokenURI);

  // Wait for this transaction to be mined
  await contract.deployed();

  // Get contract address
  console.log("Contract deployed to:", contract.address);

  // Mint 3 NFTs by sending 0.03 ether
  //let txn = await contract.mintFiguritas(10, { value: utils.parseEther('0.01') });
  //await txn.wait()

  // Get all token IDs of the owner
  //let tokens = await contract.getFiguritas(owner.address)
  //console.log("Owner has tokens: ", tokens);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
