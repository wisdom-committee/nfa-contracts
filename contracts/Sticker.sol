//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Sticker is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;
    uint256 private _albumSize;
    mapping(uint256 => uint256) private _positions; // Sticker (tokenId) => position in the album

    string public baseTokenURI;

    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant PRICE = 0.001 ether;
    uint256 public constant MAX_PER_MINT = 5;

    constructor(string memory _name, string memory _symbol, string memory _baseTokenURI, uint256 _size) 
    ERC721(_name, _symbol) {
        baseTokenURI = _baseTokenURI;
        _albumSize = _size;
    }

    function getAlbumSize() public view returns (uint256) {
        return _albumSize;
    }

    function mintStickers(uint256 _count) public payable {
        uint256 totalMinted = _tokenIds.current();
        require(totalMinted.add(_count) <= MAX_SUPPLY, "Album max supply reached");
        require(_count > 0 && _count <= MAX_PER_MINT, "Invalid count");
        require(msg.value >= PRICE.mul(_count), "Not enough ETH");

        for (uint256 i = 0; i < _count; i++) {
            _mintSticker();
        }
    }

    function getStickers(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokensId = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokensId;
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "Invalid Token ID");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, _positions[_tokenId].toString())) : "";
    }

    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed");
    }

    function _mintSticker() private {
        uint256 newTokenID = _tokenIds.current();
        _positions[newTokenID] = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, newTokenID))) % _albumSize;
        _safeMint(msg.sender, newTokenID);
        _tokenIds.increment();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
}
