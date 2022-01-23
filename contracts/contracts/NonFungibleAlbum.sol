//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract NonFungibleAlbum is ERC1155, Ownable {
    string public name;
    uint256 public size;

    uint256 public constant PRICE = 0.001 ether; // price to mint a sticker
    uint256 public constant ALBUM_PRICE = 0.01 ether; // price to mint an album
    uint256 public constant MAX_PER_MINT = 5; // max amount of stickers that can be minted in a single transaction
    uint256 public constant ALBUM_ID = 0xfff;

    constructor(
        string memory _name,
        uint256 _size,
        string memory _uri
    ) ERC1155(_uri) {
        name = _name;
        size = _size;
    }

    function mintStickers(uint256 _count) external payable {
        require(_count > 0 && _count <= MAX_PER_MINT, "Invalid amount");
        require(msg.value >= PRICE * _count, "Not enough ETH");

        for (uint256 i = 0; i < _count; i++) {
            bytes memory rng = abi.encodePacked(block.timestamp, msg.sender, i);
            uint256 id = uint256(keccak256(rng)) % size;
            _mint(msg.sender, id, 1, "");
        }
    }

    // TODO: for test purposes, remove later
    function testMintSticker(uint256 _id) external payable {
        _mint(msg.sender, _id, 1, "");
    }

    function stickerBalances(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256[] memory ownedBalances = new uint256[](size);
        for (uint256 i = 0; i < size; i++) {
            ownedBalances[i] = balanceOf(_owner, i);
        }

        return ownedBalances;
    }

    function mintAlbum() external payable {
        require(msg.value >= ALBUM_PRICE, "Not enough ETH");

        uint256 uniqueStickers;
        for (uint256 i = 0; i < size; i++) {
            if (balanceOf(msg.sender, i) > 0) {
                uniqueStickers++;
            }
        }
        require(uniqueStickers >= size, "Album is not full");

        // burn all stickers used to complete the album
        for (uint256 i = 0; i < size; i++) {
            _burn(msg.sender, i, 1);
        }

        // mint album
        _mint(msg.sender, ALBUM_ID, 1, "");
    }

    function albumBalance(address _owner) external view returns (uint256) {
        return balanceOf(_owner, ALBUM_ID);
    }

    function withdraw() external payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        payable(msg.sender).transfer(balance);
    }
}
