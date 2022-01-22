const { expect } = require("chai");

describe("NonFungibleAlbum contract", function () {

    const baseStickerURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
    const albumURI = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/99999";
    const name = "Bored Apes Stickers";
    const symbol = "APE";
    const albumSize = 10;

    beforeEach(async function () {
        [owner] = await hre.ethers.getSigners();
        contractFactory = await hre.ethers.getContractFactory("NonFungibleAlbum");
        contract = await contractFactory.deploy(name, symbol, baseStickerURI, albumURI, albumSize);
    });

    describe("Deployment", function () {

        it("Sets the right owner", async function () {
            expect(await contract.owner()).to.equal(owner.address);
        });
    });

    describe("Album functions", function () {
        
        it("Gets album size", async function () {
            expect(await contract.getAlbumSize()).to.equal(albumSize);
        });
    });
});
