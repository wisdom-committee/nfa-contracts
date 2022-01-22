//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NonFungibleAlbum is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;
    uint256 private _albumSize;
    
    mapping(uint256 => uint256) private _positionPerStickerId; // tokenId => position
    mapping(address => mapping(uint256 => bool)) private _positionStatePerAddress; // owner => (position => state)
    mapping(address => uint256) private _positionCountPerAddress; // ownder => filledPositionsCount

    string public baseStickerURI;
    string public albumURI;

    uint256 public constant MAX_SUPPLY = 1000; // max amount of stickers that will be ever emmited
    uint256 public constant PRICE = 0.001 ether; // price to mint a sticker
    uint256 public constant ALBUM_PRICE = 0.01 ether; // price to mint an album
    uint256 public constant MAX_PER_MINT = 5; // max amount of stickers that can be minted in a single transaction
    uint256 private constant ALBUM_CODE = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff; // special placeholder in _positionPerStickerId that represents an album

    constructor(string memory _name, string memory _symbol, string memory _baseStickerURI, string memory _albumURI, uint256 _size) 
    ERC721(_name, _symbol) {
        baseStickerURI = _baseStickerURI;
        albumURI = _albumURI;
        _albumSize = _size;
    }

    function getAlbumSize() external view returns (uint256) {
        return _albumSize;
    }

    function mintStickers(uint256 _count) external payable {
        uint256 totalMinted = _tokenIds.current();
        require(totalMinted.add(_count) <= MAX_SUPPLY, "Album max supply reached");
        require(_count > 0 && _count <= MAX_PER_MINT, "Invalid count");
        require(msg.value >= PRICE.mul(_count), "Not enough ETH");

        for (uint256 i = 0; i < _count; i++) {
            _mintSticker();
        }
    }

    // TODO: for test purposes, remove later
    function testMintSticker(uint256 _position) external payable {
        _testMintSticker(_position);
    }

    // TODO: burn all stickers
    function mintAlbum() external payable {
        require(msg.value >= ALBUM_PRICE, "Not enough ETH");
        require(_positionCountPerAddress[msg.sender] >= _albumSize, "Album is not full");

        uint256 id = _mintNFT();
        _positionPerStickerId[id] = ALBUM_CODE;
    }

    function getStickers(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokensId = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }

    function withdraw() external payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        payable(msg.sender).transfer(balance);
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(_exists(_tokenId), "Invalid Token ID");

        uint256 position = _positionPerStickerId[_tokenId];
        if (position != ALBUM_CODE) { // it's a sticker
            string memory baseURI = _baseURI();
            return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, position.toString())) : "";
        }

        // it's an album
        return albumURI;
    }

    function _mintSticker() private {
        uint256 id = _mintNFT();
        uint256 position = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, id))) % _albumSize;
        _positionPerStickerId[id] = position;
        if (_positionStatePerAddress[msg.sender][position] == false) {
            _positionStatePerAddress[msg.sender][position] = true;
            _positionCountPerAddress[msg.sender]++;
        }
    }

    function _testMintSticker(uint256 _position) private {
        uint256 id = _mintNFT();
        _positionPerStickerId[id] = _position;
        if (_positionStatePerAddress[msg.sender][_position] == false) {
            _positionStatePerAddress[msg.sender][_position] = true;
            _positionCountPerAddress[msg.sender]++;
        }
    }

    function _mintNFT() private returns (uint256) {
        uint256 newTokenID = _tokenIds.current();
        _safeMint(msg.sender, newTokenID);
        _tokenIds.increment();
        return newTokenID;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseStickerURI;
    }
}
