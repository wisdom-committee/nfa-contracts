const { expect } = require("chai");
const { utils } = require("ethers");

describe("NonFungibleAlbum contract", async function () {

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

    describe("Deployment", async function () {

        it("Sets the right owner", async function () {
            expect(await contract.owner()).to.be.equal(owner.address);
        });
    });

    describe("Functions", async function () {

        it("Gets album size", async function () {
            expect(await contract.getAlbumSize()).to.be.equal(albumSize);
        });

        it("Mints stickers", async function () {
            txn = await contract.mintStickers(5, { value: utils.parseEther('0.005') });
            expect(await txn.wait());
        });

        it("Gets stickers", async function () {
            txn = await contract.mintStickers(5, { value: utils.parseEther('0.005') });
            receipt = await txn.wait();

            expect(await contract.getStickers(owner.address)).to.be.an('array').of.length(5);
        });

        it("Gets sticker URI", async function () {
            txn = await contract.mintStickers(1, { value: utils.parseEther('0.005') });
            receipt = await txn.wait();

            expect(await contract.tokenURI(0)).to.contain(baseStickerURI);
        });
    });
});
