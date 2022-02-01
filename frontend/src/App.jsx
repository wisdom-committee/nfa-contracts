import web3 from './web3'
import React from 'react'
import { Album } from './components/Album'
import NonFungibleAlbumService from './services/NonFungibleAlbumService'
import { StickerList } from './components/StickerList'

class App extends React.Component {
  state = {
    message: '',
    countToBuy: 1,
    myStickers: [],
    stickersCount: 0,
    albumSize: 0,
    idToBuy: 0,
    lastTransactionHash: undefined,
    lastTransactionStickers: {}
  }

  async componentDidMount () {
    await this.reloadAlbum()
    NonFungibleAlbumService.subscribeMintStickers(this.handleOnTransferSingle)
  }

  handleOnTransferSingle = async ({ id, value, transactionHash }) => {
    const { lastTransactionHash, lastTransactionStickers } = this.state

    if (lastTransactionHash !== transactionHash) {
      this.setState({
        lastTransactionHash: transactionHash,
        lastTransactionStickers: {
          [id]: value
        }
      })
      await this.reloadAlbum()
    } else {
      const lastValue = lastTransactionStickers[id] || 0
      this.setState({
        lastTransactionStickers: {
          ...lastTransactionStickers,
          [id]: lastValue + value
        }
      })
    }
  }

  parseLastTransactionStickers = () => {
    const { lastTransactionStickers, myStickers } = this.state

    const stickers = myStickers
      .filter(({ id }) => !!lastTransactionStickers[id])
      .map(({ id, ...rest }) => ({
        ...rest,
        id,
        balance: lastTransactionStickers[id]
      }))

    return stickers
  }

  async reloadAlbum () {
    const accounts = await web3.eth.getAccounts()
    const myStickers = await NonFungibleAlbumService.getStickers(accounts[0])

    let stickersCount = 0
    for (const sticker of myStickers) {
      stickersCount += parseInt(sticker.balance)
    }

    const albumSize = myStickers.length

    this.setState({ myStickers, stickersCount, albumSize })
  }

  handleBuyStickers = async (event) => {
    event.preventDefault()

    let countToBuy = this.state.countToBuy
    countToBuy = Number.parseInt(countToBuy)
    const accounts = await web3.eth.getAccounts()
    this.setState({ message: 'Waiting on transaction success...' })
    try {
      await NonFungibleAlbumService.mintStickers(accounts[0], countToBuy)

      this.setState({ message: 'You have minted ' + countToBuy + ' new sticker(s)' })
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` })
    }
  }

  handleBuyStickerById = async (event) => {
    event.preventDefault()

    const idToBuy = Number.parseInt(this.state.idToBuy)
    const accounts = await web3.eth.getAccounts()
    this.setState({ message: 'Waiting on transaction success...' })
    try {
      await NonFungibleAlbumService.mintStickerById(accounts[0], idToBuy)
      this.setState({ message: 'You have minted 1 new sticker' })
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` })
    }
  }

  handleClaimAlbum = async (event) => {
    event.preventDefault()

    const accounts = await web3.eth.getAccounts()
    this.setState({ message: 'Waiting on transaction success...' })

    try {
      await NonFungibleAlbumService.mintAlbum(accounts[0])
      this.setState({ message: 'You have minted the Album!' })
      return this.reloadAlbum()
    } catch (e) {
      this.setState({ message: `Transaction fail or rejected. ${e ? 'Message: ' + e.toString() : ''}` })
    }
  }

  render () {
    return (
      <div>
        <h1>Non-fungible Albums</h1>
        <form onSubmit={this.handleBuyStickers}>
          <label>Buy stickers (up to 5): </label>
          <input
            value={this.state.countToBuy}
            onChange={(event) => {
              this.setState({ countToBuy: event.target.value })
            }}
          />
          <button>Buy</button>
        </form>

        <form onSubmit={this.handleBuyStickerById}>
          <label>[Test] Buy sticker with ID: </label>
          <input
            value={this.state.idToBuy}
            onChange={(event) => {
              this.setState({ idToBuy: event.target.value })
            }}
          />
          <button>Buy</button>
        </form>

        <form onSubmit={this.handleClaimAlbum}>
          <label>Claim album! </label>
          <button>Claim</button>
        </form>

        <h3>{this.state.message}</h3>
        <h2>Your latest adquired stickers</h2>
        <StickerList
          stickers={this.parseLastTransactionStickers()}
          transactionHash={this.state.lastTransactionHash}
        />

        <h2>Your Album</h2>
        <ul>
          <li>Album size: {this.state.albumSize}</li>
          <li>Stickers owned: {this.state.stickersCount}</li>
        </ul>
        <Album size={this.state.albumSize} stickers={this.state.myStickers} />
      </div>
    )
  }
}

export default App
