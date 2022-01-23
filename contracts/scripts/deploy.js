const { utils } = require("ethers");

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const album = {
  name: "Bored Apes Album",
  size: 10,
  uri: "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/{id}",
  id: 99
};

async function main() {
  let { contract, owner } = await deploy();
  await smokeTests(contract, owner);
}

async function deploy() {
  const [owner] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("NonFungibleAlbum");
  const contract = await contractFactory.deploy(album.name, album.size, album.uri, album.id);
  await contract.deployed();

  // This solves the bug in Mumbai network where the contract address is not the real one
  // See https://github.com/nomiclabs/hardhat/issues/2162
  const txHash = contract.deployTransaction.hash;
  const txReceipt = await ethers.provider.waitForTransaction(txHash);
  console.log("Contract address:", txReceipt.contractAddress);

  // TODO: reenable this once previous bug is fixed
  //console.log("Contract address:", contract.address);
  return { contract, owner };
}

async function smokeTests(contract, owner) {
  console.log();
  console.log("Smoke tests:");

  console.log("> Minting 5 stickers");
  await contract.mintStickers(5, { value: utils.parseEther('0.005') });

  console.log("> Sticker balances:");
  balances = await contract.stickerBalances(owner.address)
  for (const [i, v] of balances.entries())
    console.log("> [", i, "]:", parseInt(v));
}