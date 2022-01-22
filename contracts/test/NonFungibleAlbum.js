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
            response = await contract.owner();
            expect(response).to.be.equal(owner.address);
        });
    });

    describe("Functions", async function () {

        it("Gets album size", async function () {
            response = await contract.getAlbumSize();
            expect(response).to.be.equal(albumSize);
        });

        it("Mints stickers", async function () {
            response = contract.mintStickers(5, { value: utils.parseEther('0.005') });
            await expect(response).to.be.not.reverted;
        });

        it("Gets stickers", async function () {
            await contract.mintStickers(5, { value: utils.parseEther('0.005') });

            response = await contract.getStickers(owner.address);
            expect(response).to.be.an('array').of.length(5);
        });

        it("Gets sticker URI", async function () {
            await contract.mintStickers(1, { value: utils.parseEther('0.005') });

            response = await contract.tokenURI(0);
            expect(response).to.contain(baseStickerURI);
        });

        describe("Minting albums", async function () {

            it("Fails to mint album when not enough ETH is paid", async function () {
                response = contract.mintAlbum({ value: utils.parseEther('0.009') });
                e = "Not enough ETH";
                await expect(response).to.be.revertedWith(e);
            });

            it("Fails to mint album when it's still not completed", async function () {
                await contract.mintStickers(3, { value: utils.parseEther('0.005') });

                response = contract.mintAlbum({ value: utils.parseEther('0.01') });
                e = "Album is not full";
                await expect(response).to.be.revertedWith(e);
            });

            it("Mints an album", async function () {
                for (i = 0; i < albumSize; i++) {
                    await contract.testMintSticker(i);
                }

                response = contract.mintAlbum({ value: utils.parseEther('0.01') });
                await expect(response).to.be.not.reverted;

                response = await contract.tokenURI(albumSize);
                expect(response).to.be.equal(albumURI);
            });
        });
    });
});
