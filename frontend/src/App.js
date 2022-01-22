import React from "react";
import web3 from "./web3";
import stickerContract from "./contracts/Sticker";
import { Album } from "./components/Album"

const STICKER_FEE = 0.001
const ALBUM_FEE = 0.01

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    console.log(file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    console.log(content);
    return content;
  }
};

class App extends React.Component {
  state = {
    message: "",
    countToBuy: 1,
    myStickers: [],
    albumSize: 0,
    idToBuy: 0,
  };

  async componentDidMount() {
    this.fetchMyStickers();
  }

  async fetchMyStickers() {
    const accounts = await web3.eth.getAccounts();

    const stickersIds = await stickerContract.methods.getStickers(accounts[0]).call();
    const albumSize = await stickerContract.methods.getAlbumSize().call();

    const myStickers = [];
    for (let tokenIndex = 0; tokenIndex < stickersIds.length; tokenIndex++) {
      const stickersId = stickersIds[tokenIndex];
      try {
        const tokenURI = await stickerContract.methods.tokenURI(stickersId).call();
        console.log("tokenURI", tokenURI);

        const ipfsHash = tokenURI.replace("ipfs://", "");
        console.log("ipfsHash", ipfsHash);

        const jsonManifestBuffer = await getFromIPFS(ipfsHash);
        console.log("jsonManifestBuffer", jsonManifestBuffer);

        const position = Number(tokenURI.split('/').reverse()[0]);

        try {
          const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
          console.log("jsonManifest", jsonManifest);
          myStickers.push({ 
            id: stickersId,
            uri: tokenURI,
            owner: accounts[0],
            position,
            ...jsonManifest });
        } catch (e) {
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    };

    this.setState({ myStickers, albumSize})
  }

  // mint stickers
  handleBuy = async (event) => {
    event.preventDefault();

    let countToBuy = this.state.countToBuy;
    countToBuy = Number.parseFloat(countToBuy);
    if (!(Number.isInteger(countToBuy) && countToBuy > 0)) {
      this.setState({ message: 'You must pass a positive integer' });
      return;
    }

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    try {
      await stickerContract.methods.mintStickers(countToBuy).send({
        from: accounts[0],
        value: web3.utils.toWei(String(countToBuy * STICKER_FEE), "ether")
      });
      this.setState({ message: "You have minted new stickers" });
      await this.fetchMyStickers();
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` });
    }
  }

  handleBuyById = async (event) => {
    event.preventDefault();

    const idToBuy = Number.parseInt(this.state.idToBuy);
    
    if (!(Number.isInteger(idToBuy) && idToBuy > 0)) {
      this.setState({ message: 'You must pass a positive integer' });
      return;
    }

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    try {
      await stickerContract.methods.testMintSticker(idToBuy).send({
        from: accounts[0],
        value: web3.utils.toWei(String(STICKER_FEE), "ether")
      });
      this.setState({ message: "You have minted a new sticker" });
      return this.fetchMyStickers();
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` });
    }
  }

  handleClaimAlbum = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    try {
      await stickerContract.methods.mintAlbum().send({
        from: accounts[0],
        value: web3.utils.toWei(String(ALBUM_FEE), "ether")
      });
      this.setState({ message: "You have minted the Album" });
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` });
    }
  }

  render() {
    return (
      <div>
        <h1>Stickers Contract</h1>
        <form onSubmit={this.handleBuy}>
          <label>Buy the following amount of stickers: </label>
          <input
            value={this.state.countToBuy}
            onChange={(event) => {
              this.setState({ countToBuy: event.target.value });
            }}
          />
          <button>Buy</button>
        </form>

        <form onSubmit={this.handleBuyById}>
          <label>Buy an specific stickers: </label>
          <input
            value={this.state.idToBuy}
            onChange={(event) => {
              this.setState({ idToBuy: event.target.value });
            }}
          />
          <button>Buy</button>
        </form>

        <form onSubmit={this.handleClaimAlbum}>
          <label>Claim the completed album: </label>
          <button>Claim</button>
        </form>

        <h1>My stickers (album size: {this.state.albumSize})</h1>
        <h2>{this.state.message}</h2>
        <Album size={this.state.albumSize} stickers={this.state.myStickers} />
      </div >
    );
  }
}
export default App;
