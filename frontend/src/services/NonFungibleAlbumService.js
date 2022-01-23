import web3 from "../web3";
import contract from "../contracts/NonFungibleAlbum";

const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
const { BufferList } = require("bl");

const STICKER_FEE = 0.001
const ALBUM_FEE = 0.01

const NonFungibleAlbumService = {

    getAlbumSize: async function () {
        return await contract.methods.size().call();
    },

    getStickers: async function (account) {
        const stickerBalances = await contract.methods.stickerBalances(account).call();
        
        const stickers = [];
        for (let stickerId = 0; stickerId < stickerBalances.length; stickerId++) {
            try {
                // TODO: extract to more methods
                let stickerURI = await contract.methods.uri(stickerId).call();
                stickerURI = stickerURI.replace("{id}", stickerId);
                console.log("stickerURI:", stickerURI);

                const ipfsHash = stickerURI.replace("ipfs://", "");
                console.log("ipfsHash:", ipfsHash);

                const jsonManifestBuffer = await getFromIPFS(ipfsHash);
                console.log("jsonManifestBuffer", jsonManifestBuffer);

                const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
                console.log("jsonManifest", jsonManifest);

                stickers.push({
                    id: stickerId,
                    uri: stickerURI,
                    balance: parseInt(stickerBalances[stickerId]),
                    ...jsonManifest
                });
            } catch (e) {
                console.log(e);
            }
        };

        return stickers;
    },

    mintStickers: async function (account, count) {
        if (!Number.isInteger(count) || count < 1 || count > 5)
            throw new Error("Only 1 to 5 stickers can be minted in the same transaction");

        return await contract.methods.mintStickers(count)
            .send({
                from: account,
                value: web3.utils.toWei(String(count * STICKER_FEE), "ether")
            });
    },

    mintStickerById: async function (account, id) {
        if (!Number.isInteger(id) || id < 0) {
            throw new Error("Sticker ID is invalid")
        }

        return await contract.methods.testMintSticker(id)
            .send({
                from: account,
                value: web3.utils.toWei(String(STICKER_FEE), "ether")
            });
    },

    mintAlbum: async function (account) {
        return await contract.methods.mintAlbum()
            .send({
                from: account,
                value: web3.utils.toWei(String(ALBUM_FEE), "ether")
            });
    },
};

const getFromIPFS = async hashToGet => {
    for await (const file of ipfs.get(hashToGet)) {
        if (!file.content) continue;

        const content = new BufferList();
        for await (const chunk of file.content) {
            content.append(chunk);
        }

        return content;
    }
};

export default NonFungibleAlbumService;