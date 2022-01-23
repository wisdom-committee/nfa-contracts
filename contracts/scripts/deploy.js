const { utils } = require("ethers");

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function main() {
  // Config: Bored apes stickers
  const name = "Bored Apes Album";
  const size = 10;
  const uri = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/{id}";

  // Deploy
  const [owner] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("NonFungibleAlbum");
  const contract = await contractFactory.deploy(name, size, uri);
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);

  // Smoke tests
  await smokeTests(contract, owner);
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