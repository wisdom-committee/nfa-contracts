import web3 from "../web3";
import contract from "../contracts/NonFungibleAlbum";

const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
const { BufferList } = require("bl");

const STICKER_FEE = 0.001
const ALBUM_FEE = 0.01
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

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

const parseSticker = async (stickerId, stickerBalance) => {
    try {
        let stickerURI = await contract.methods.uri(stickerId)
            .call()
        stickerURI = stickerURI.replace("{id}", stickerId);
        const ipfsHash = stickerURI.replace("ipfs://", "");
        const jsonManifestBuffer = await getFromIPFS(ipfsHash);
        const jsonManifest = JSON.parse(jsonManifestBuffer.toString());

        return {
            id: stickerId,
            uri: stickerURI,
            balance: parseInt(stickerBalance),
            ...jsonManifest
        };
    } catch (e) {
        console.log(e);
    }
}

const NonFungibleAlbumService = {

    subscribeMintStickers: async cb => {
        const addresses = await web3.eth.getAccounts();
        const operator = addresses[0];
        const filter = {
            filter: {
                operator,
                from: ZERO_ADDRESS,
                to: operator,
            }
        }

        contract.events.TransferSingle(filter)
            .on('data', function(event) {
                const {
                    transactionHash,
                    returnValues: {
                        id,
                        value,
                    },
                } = event;
                cb({ id, value: Number(value), transactionHash })
            })
            .on('error', console.error);
    },

    getAlbumSize: async function () {
        return await contract.methods.size().call();
    },

    // stickers are not returned in order!
    getStickers: async function (account) {
        const stickerBalances = await contract.methods.stickerBalances(account).call();
        const stickers = [];
        for (const [stickerId, stickerBalance] of stickerBalances.entries()) {
            stickers.push(parseSticker(stickerId, stickerBalance));
        };

        return await Promise.all(stickers);
    },

    mintStickers: async function (account, count) {
        if (!Number.isInteger(count) || count < 1 || count > 5)
            throw new Error("Only 1 to 5 stickers can be minted in the same transaction");

        await contract.methods.mintStickers(count)
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

    parseSticker
};

export default NonFungibleAlbumService;