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
  const contractFactory = await hre.ethers.getContractFactory("Sticker");
  const contract = await contractFactory.deploy(name, symbol, baseStickerURI, albumURI, albumSize);
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);

  await smokeTests(contract, owner);
}

async function smokeTests(contract, owner) {
  // Smoke tests: get album size, mint stickers, retrieve stickers, read stickers metadata
  const albumSize = await contract.getAlbumSize();
  console.log("Album size:", albumSize);

  let txn = await contract.mintStickers(5, { value: utils.parseEther('0.05') });
  await txn.wait()

  console.log("Owner has tokens: ", await contract.getStickers(owner.address));

  for (let i = 0; i < 5; i++) {
    console.log("Sticker", i, "has URI:", await contract.tokenURI(i));
  }

  try {
    console.log("Trying to mint - not full - album (should fail)");
    let txn = await contract.mintAlbum({ value: utils.parseEther('0.01') });
    await txn.wait()
  } catch (error) {
    console.log("it failed!");
  };

  for (let i = 0; i < albumSize; i++) {
    let txn = await contract.testMintSticker(i);
    await txn;
    console.log("Sticker", i, "minted");
  }

  console.log("Trying to mint - full - album (should work)");
  txn = await contract.mintAlbum({ value: utils.parseEther('0.01') });
  await txn.wait()
}
