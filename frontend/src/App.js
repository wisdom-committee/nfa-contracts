import React from "react";
import web3 from "./web3";
import contract from "./contracts/NonFungibleAlbum";
import { Album } from "./components/Album"

const STICKER_FEE = 0.001
const ALBUM_FEE = 0.01

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

class App extends React.Component {
  state = {
    message: "",
    countToBuy: 1,
    myStickers: [],
    stickersCount: 0,
    albumSize: 0,
    idToBuy: 0,
  };

  async componentDidMount() {
    this.fetchMyStickers();
  }

  async fetchMyStickers() {
    const accounts = await web3.eth.getAccounts();

    const stickerBalances = await contract.methods.stickerBalances(accounts[0]).call();
    const albumSize = await contract.methods.size().call();

    const myStickers = [];
    let stickersCount = 0;
    for (let stickerId = 0; stickerId < stickerBalances.length; stickerId++) {

      const stickerBalance = parseInt(stickerBalances[stickerId]);
      stickersCount += stickerBalance;

      try {
        let stickerURI = await contract.methods.uri(stickerId).call();
        stickerURI = stickerURI.replace("{id}", stickerId);
        console.log("stickerURI:", stickerURI);

        const ipfsHash = stickerURI.replace("ipfs://", "");
        console.log("ipfsHash:", ipfsHash);

        const jsonManifestBuffer = await getFromIPFS(ipfsHash);
        console.log("jsonManifestBuffer", jsonManifestBuffer);

        try {
          const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
          console.log("jsonManifest", jsonManifest);

          //TODO: refactor with id+balance
          myStickers.push({
            id: stickerId,
            uri: stickerURI,
            owner: accounts[0],
            balance: stickerBalance,
            ...jsonManifest
          });
        } catch (e) {
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    };

    this.setState({ myStickers, stickersCount, albumSize })
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
    if (!(Number.isInteger(countToBuy) && countToBuy <= 5)) {
      this.setState({ message: "You can't buy more than 5 stickers" });
      return;
    }

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: "Waiting on transaction success..." });

    try {
      await contract.methods.mintStickers(countToBuy).send({
        from: accounts[0],
        value: web3.utils.toWei(String(countToBuy * STICKER_FEE), "ether")
      });
      this.setState({ message: "You have minted " + countToBuy + " new sticker(s)" });
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
      await contract.methods.testMintSticker(idToBuy).send({
        from: accounts[0],
        value: web3.utils.toWei(String(STICKER_FEE), "ether")
      });
      this.setState({ message: "You have minted 1 new sticker" });
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
      await contract.methods.mintAlbum().send({
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
        <h1>Non-fungible Albums</h1>
        <form onSubmit={this.handleBuy}>
          <label>Buy stickers (up to 5): </label>
          <input
            value={this.state.countToBuy}
            onChange={(event) => {
              this.setState({ countToBuy: event.target.value });
            }}
          />
          <button>Buy</button>
        </form>

        <form onSubmit={this.handleBuyById}>
          <label>[Test] Buy sticker with ID: </label>
          <input
            value={this.state.idToBuy}
            onChange={(event) => {
              this.setState({ idToBuy: event.target.value });
            }}
          />
          <button>Buy</button>
        </form>

        <form onSubmit={this.handleClaimAlbum}>
          <label>Claim album! </label>
          <button>Claim</button>
        </form>

        <p></p>
        <ul>
          <li>Album size: {this.state.albumSize}</li>
          <li>Stickers owned: {this.state.stickersCount}</li>
        </ul>

        <h2>{this.state.message}</h2>
        <Album size={this.state.albumSize} stickers={this.state.myStickers} />
      </div >
    );
  }
}

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

export default App;
