const { expect } = require("chai");
const { utils } = require("ethers");

describe("TokenSwap contract", async function () {

    beforeEach(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        nfaContractFactory = await hre.ethers.getContractFactory("NonFungibleAlbum");
        nfaContract = await contractFactory.deploy("someAlbum", 10, "someUri", 99);

        tsContractFactory = await hre.ethers.getContractFactory("TokenSwap");
        tsContract = await tsContractFactory.deploy();
    });

    describe("Deployment", async function () {

        it("Sets the right owner", async function () {
            response = await tsContract.owner();
            expect(response).to.be.equal(owner.address);
        });
    });

    describe("Functions", async function () {

        describe("Listing", async function () {

            it("Fails to list token when approval is not given", async function () {
                await nfaContract.testMintSticker(1);

                response = tsContract.list(nfaContract.address, 1, 2, { value: utils.parseEther('0.001') });
                e = "Approval to transfer your tokens has to be given to this contract";
                await expect(response).to.be.revertedWith(e);
            });

            it("Fails to list when not enough ETH is paid", async function () {
                await nfaContract.testMintSticker(1);
                await nfaContract.setApprovalForAll(tsContract.address, true);

                response = tsContract.list(nfaContract.address, 1, 2, { value: utils.parseEther('0.0005') });
                e = "Not enough ETH to pay for listing";
                await expect(response).to.be.revertedWith(e);
            });

            it("Lists a token", async function () {
                await nfaContract.testMintSticker(1);
                await nfaContract.setApprovalForAll(tsContract.address, true);

                await tsContract.list(nfaContract.address, 1, 2, { value: utils.parseEther('0.001') });

                response = await tsContract.listings();
                expect(response).to.be.an('array').of.length(1);
                expect(response[0].tokenIdWanted).to.be.equal(2);
            });
        });

        describe("Swaping", async function () {

            it("Fails to swap a token when not enough ETH is paid", async function () {
                await nfaContract.testMintSticker(1);
                await nfaContract.setApprovalForAll(tsContract.address, true);
                await nfaContract.connect(addr1).testMintSticker(2);
                await nfaContract.connect(addr1).setApprovalForAll(tsContract.address, true);

                await tsContract.list(nfaContract.address, 1, 2, { value: utils.parseEther('0.001') });

                response = tsContract.connect(addr1).swap(0, { value: utils.parseEther('0.0005') });
                e = "Not enough ETH to pay for swaping";
                await expect(response).to.be.revertedWith(e);
            });

            it("Fails to swap a token when approval is not given", async function () {
                await nfaContract.testMintSticker(1);
                await nfaContract.setApprovalForAll(tsContract.address, true);
                await nfaContract.connect(addr1).testMintSticker(2);

                await tsContract.list(nfaContract.address, 1, 2, { value: utils.parseEther('0.001') });

                response = tsContract.connect(addr1).swap(0, { value: utils.parseEther('0.001') });
                e = "Approval to transfer your tokens has to be given to this contract";
                await expect(response).to.be.revertedWith(e);
            });

            it("Fails to swap a token when listing doesn't exist", async function () {
                await nfaContract.connect(addr1).testMintSticker(2);
                await nfaContract.connect(addr1).setApprovalForAll(tsContract.address, true);

                response = tsContract.connect(addr1).swap(0, { value: utils.parseEther('0.001') });
                e = "Invalid listingId";
                await expect(response).to.be.revertedWith(e);
            });

            it("Swaps a token", async function () {
                await nfaContract.testMintSticker(1);
                await nfaContract.setApprovalForAll(tsContract.address, true);
                await nfaContract.connect(addr1).testMintSticker(2);
                await nfaContract.connect(addr1).setApprovalForAll(tsContract.address, true);

                await tsContract.list(nfaContract.address, 1, 2, { value: utils.parseEther('0.001') });
                await tsContract.connect(addr1).swap(0, { value: utils.parseEther('0.001') });

                //response = await tsContract.listings();
                //expect(response).to.be.an('array').of.length(0);

                response = await nfaContract.stickerBalances(owner.address);
                expect(totalBalance(response)).to.be.equal(1);
                expect(response[2]).to.be.equal(1);

                response = await nfaContract.stickerBalances(addr1.address);
                expect(totalBalance(response)).to.be.equal(1);
                expect(response[1]).to.be.equal(1);
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
