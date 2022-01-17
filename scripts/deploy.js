const { utils } = require("ethers");

async function main() {
  // Config: Bored apes stickers
  const baseTokenURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
  const name = "Bored Apes Stickers"
  const symbol = "APE"
  const albumSize = 100

  // Deploy
  const [owner] = await hre.ethers.getSigners();
  const contractFactory = await hre.ethers.getContractFactory("Sticker");
  const contract = await contractFactory.deploy(name, symbol, baseTokenURI, albumSize);
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);

  // Smoke tests: get album size, mint stickers, retrieve stickers, read stickers metadata
  console.log("Album size:", await contract.getAlbumSize());

  let txn = await contract.mintStickers(5, { value: utils.parseEther('0.05') });
  await txn.wait()

  console.log("Owner has tokens: ", await contract.getStickers(owner.address));

  for (let i = 0; i < 5; i++) {
    console.log("Sticker", i, "has URI:", await contract.tokenURI(i));
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
