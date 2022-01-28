//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TokenSwap is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _listingIdCounter;
    mapping(uint256 => MarketItem) private _listingIdToListing;

    uint256 public constant LISTING_FEE = 0.001 ether;
    uint256 public constant SWAP_FEE = 0.001 ether;

    /** 
    To start simple, we operate only with tokens that belong to the same contract
    but this could very well work with tokens from different contracts 
    */
    struct Listing {
        address tokenContract;
        uint256 tokenIdOffered;
        uint256 tokenIdWanted;
        address publisher;
    }

    function list(
        address _tokenContract,
        uint256 _tokenIdOffered,
        uint256 _tokenIdWanted,
        address _publisher
    ) public payable {
        bool weAreApproved = ERC1155(_tokenContract).isApprovedForAll(
            msg.sender,
            address(this)
        );
        require(
            weAreApproved,
            "Approval to transfer your tokens has to be given to this contract"
        );
        require(msg.value >= LISTING_FEE, "Not enough ETH to pay for listing");

        _listingIdCounter.increment();
        uint256 listingId = _listingIdCounter.current();
        _listingIdToListing[listingId] = Listing(
            _tokenContract,
            _tokenIdOffered,
            _tokenIdWanted,
            _publisher
        );

        // TODO: emit some event
        // TODO: expiration time?
    }

    function swap(uint256 _listingId) public payable {
        Listing listing = _listingIdToListing[_listingId];

        require(listing.tokenContract != address(0), "Invalid listingId");

        bool weAreApproved = ERC1155(listing.tokenContract).isApprovedForAll(
            msg.sender,
            address(this)
        );
        require(
            weAreApproved,
            "Approval to transfer your tokens has to be given to this contract"
        );

        require(msg.value >= SWAP_FEE, "Not enough ETH to pay for swaping");

        ERC1155(listing.tokenContract).safeTransferFrom(
            msg.sender,
            listing.publisher,
            listing.tokenIdWanted,
            1,
            []
        );

        ERC1155(listing.tokenContract).safeTransferFrom(
            listing.publisher,
            msg.sender,
            listing.tokenIdOffered,
            1,
            []
        );

        delete _listingIdToListing[_listingId];
        // TODO: emit some event
    }
}
