const { expect } = require("chai");
const { utils } = require("ethers");

describe("NonFungibleAlbum contract", async function () {

    const name = "Bored Apes Album";
    const size = 10;
    const uri = "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/{id}";

    beforeEach(async function () {
        [owner] = await hre.ethers.getSigners();
        contractFactory = await hre.ethers.getContractFactory("NonFungibleAlbum");
        contract = await contractFactory.deploy(name, size, uri);
    });

    describe("Deployment", async function () {

        it("Sets the right owner", async function () {
            response = await contract.owner();
            expect(response).to.be.equal(owner.address);
        });
    });

    describe("Functions", async function () {

        it("Gets album size", async function () {
            response = await contract.size();
            expect(response).to.be.equal(size);
        });

        it("Gets URI", async function () {
            response = await contract.uri(0);
            expect(response).to.equal(uri);
        });

        describe("Minting stickers", async function () {

            it("Fails to mint sticker when not enough ETH is paid", async function () {
                response = contract.mintStickers(1, { value: utils.parseEther('0.0009') });
                e = "Not enough ETH";
                await expect(response).to.be.revertedWith(e);
            });

            it("Fails to mint stickers when amount exceeds limit", async function () {
                response = contract.mintStickers(6, { value: utils.parseEther('0.006') });
                e = "Invalid amount";
                await expect(response).to.be.revertedWith(e);
            });

            it("Mints stickers", async function () {
                await contract.mintStickers(5, { value: utils.parseEther('0.005') });

                response = await contract.stickerBalances(owner.address);
                expect(response).to.be.an('array').of.length(size);
                expect(totalBalance(response)).to.be.equal(5);
            });
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

            it("Mints an album, burning stickers", async function () {
                for (i = 0; i < size; i++) {
                    await contract.testMintSticker(i);
                }

                response = contract.mintAlbum({ value: utils.parseEther('0.01') });
                await expect(response).to.be.not.reverted;

                response = await contract.albumBalance(owner.address);
                expect(response).to.be.equal(1);

                response = await contract.stickerBalances(owner.address);
                expect(response).to.be.an('array').of.length(size);
                expect(totalBalance(response)).to.be.equal(0);
            });
        });
    });
});

function totalBalance(stickerBalances) {
    total = 0;
    for (i = 0; i < stickerBalances.length; i++) {
        total += parseInt(stickerBalances[i]);
    }

    return total;
}
