//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

//TODO: use safemath
contract NonFungibleAlbum is Ownable {
    using Strings for uint256;

    // id => (owner => balance)
    mapping (uint256 => mapping(address => uint256)) private _balances;

    // owner => (id => balance)
    mapping (address => mapping(uint256 => uint256)) private _iBalances;

    mapping (address => uint256) _albumBalances;

    string public albumName;
    uint256 public albumSize;
    string public baseStickerURI;
    string public albumURI;

    uint256 public constant PRICE = 0.001 ether; // price to mint a sticker
    uint256 public constant ALBUM_PRICE = 0.01 ether; // price to mint an album
    uint256 public constant MAX_PER_MINT = 5; // max amount of stickers that can be minted in a single transaction
    
    constructor(string memory _albumName, uint256 _albumSize, string memory _baseStickerURI, string memory _albumURI) {
        albumName = _albumName;
        albumSize = _albumSize;
        baseStickerURI = _baseStickerURI;
        albumURI = _albumURI;
    }

    function mintStickers(uint256 _count) external payable {
        require(_count > 0 && _count <= MAX_PER_MINT, "Invalid amount");
        require(msg.value >= PRICE * _count, "Not enough ETH");

        for (uint256 i = 0; i < _count; i++) {
            uint256 id = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % albumSize;
            _balances[id][msg.sender]++;
            _iBalances[msg.sender][id]++;
        }
    }

    // TODO: for test purposes, remove later
    function testMintSticker(uint256 _id) external payable {
        _balances[_id][msg.sender]++;
        _iBalances[msg.sender][_id]++;
    }

    function stickersBalance(address _owner) external view returns (uint256[] memory) {
        uint256[] memory ownedBalances = new uint256[](albumSize);
        for (uint256 i = 0; i < albumSize; i++) {
            ownedBalances[i] = _iBalances[_owner][i];
        }

        return ownedBalances;
    }

    // TODO: burn all stickers
    function mintAlbum() external payable {
        require(msg.value >= ALBUM_PRICE, "Not enough ETH");

        uint256 uniqueStickers;
        for (uint256 i = 0; i < albumSize; i++) {
            if (_balances[i][msg.sender]>0){
                uniqueStickers++;
            }
        }
        require(uniqueStickers >= albumSize, "Album is not full");

        // burn all stickers
        for (uint256 i = 0; i < albumSize; i++) {
            _balances[i][msg.sender]--;
            _iBalances[msg.sender][i]--;
        }
        
        // mint album
        _albumBalances[msg.sender]++;
    }

    function albumBalance(address _owner) external view returns (uint256) {
        return _albumBalances[_owner];
    }

    function stickerURI(uint256 _id) public view returns (string memory) {
        require(_id < albumSize, "Invalid sticker ID");
        return string(abi.encodePacked(baseStickerURI, _id.toString()));
    }

    function withdraw() external payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        payable(msg.sender).transfer(balance);
    }
}
