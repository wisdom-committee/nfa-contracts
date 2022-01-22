const { utils } = require("ethers");

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function main() {
  // Config: Bored apes stickers
  const baseStickerURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
  const albumURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/99999"
  const name = "Bored Apes Stickers"
  const symbol = "APE"
  const albumSize = 10

  // Deploy
  const [owner] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("NonFungibleAlbum");
  const contract = await contractFactory.deploy(name, symbol, baseStickerURI, albumURI, albumSize);
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);

  await smokeTests(contract);
}

async function smokeTests(contract) {
  console.log();
  console.log("Smoke tests:");
  
  console.log("> Minting 5 stickers");
  await contract.mintStickers(5, { value: utils.parseEther('0.005') });

  for (let i = 0; i < 5; i++) {
    console.log("> Sticker", i, "has URI:", await contract.tokenURI(i));
  }
}