import web3 from "./web3";
import React from "react";
import { Album } from "./components/Album"
import NonFungibleAlbumService from "./services/NonFungibleAlbumService";

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
    this.reloadAlbum();
  }

  async reloadAlbum() {
    const accounts = await web3.eth.getAccounts();
    const myStickers = await NonFungibleAlbumService.getStickers(accounts[0]);
    
    let stickersCount = 0;
    for (const sticker of myStickers) {
      stickersCount += parseInt(sticker.balance);
    }

    const albumSize = myStickers.length;

    this.setState({ myStickers, stickersCount, albumSize });
  }

  handleBuyStickers = async (event) => {
    event.preventDefault();

    let countToBuy = this.state.countToBuy;
    countToBuy = Number.parseInt(countToBuy);
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "Waiting on transaction success..." });
    try {
      await NonFungibleAlbumService.mintStickers(accounts[0], countToBuy);
      this.setState({ message: "You have minted " + countToBuy + " new sticker(s)" });
      await this.reloadAlbum();
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` });
    }
  }

  handleBuyStickerById = async (event) => {
    event.preventDefault();

    const idToBuy = Number.parseInt(this.state.idToBuy);
    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "Waiting on transaction success..." });
    try {
      await NonFungibleAlbumService.mintStickerById(accounts[0], idToBuy);
      this.setState({ message: "You have minted 1 new sticker" });
      return this.reloadAlbum();
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` });
    }
  }

  handleClaimAlbum = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    this.setState({ message: "Waiting on transaction success..." });

    try {
      await NonFungibleAlbumService.mintAlbum(accounts[0]);
      this.setState({ message: "You have minted the Album!" });
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` });
    }
  }

  render() {
    return (
      <div>
        <h1>Non-fungible Albums</h1>
        <form onSubmit={this.handleBuyStickers}>
          <label>Buy stickers (up to 5): </label>
          <input
            value={this.state.countToBuy}
            onChange={(event) => {
              this.setState({ countToBuy: event.target.value });
            }}
          />
          <button>Buy</button>
        </form>

        <form onSubmit={this.handleBuyStickerById}>
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

export default App;
