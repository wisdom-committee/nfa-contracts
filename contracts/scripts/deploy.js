const { utils } = require("ethers");

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function main() {
  // Config: Bored apes stickers
  const albumName = "Bored Apes Stickers"
  const albumSize = 10
  const baseStickerURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
  const albumURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/99999"

  // Deploy
  const [owner] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("NonFungibleAlbum");
  const contract = await contractFactory.deploy(albumName, albumSize, baseStickerURI, albumURI);
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