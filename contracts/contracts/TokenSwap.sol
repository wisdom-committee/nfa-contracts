//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/*
TODO:
- Allow to swap multiple tokens
- Allow to list tokens accepting any other token (could be represented as tokenId==0)
  - `offer` function, so publisher has to accept/decline the swap
  - `accept(offerId)`
- Allow tokens from different contracts
- Emit events
- Expiration time on listings?
- Reentrancy lock on swap
- Unlist
- list: require contract is ERC1155
*/
contract TokenSwap is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _listingIdCounter;
    mapping(uint256 => Listing) private _listingIdToListing;

    uint256 public constant LISTING_FEE = 0.001 ether;
    uint256 public constant SWAP_FEE = 0.001 ether;

    /** 
    To start simple, we operate only with tokens that belong to the same contract
    but this could very well work with tokens from different contracts 
    */
    struct Listing {
        uint256 id;
        bool isActive;
        address tokenContract;
        uint256 tokenIdOffered;
        uint256 tokenIdWanted;
        address publisher;
    }

    function activeListings() external view returns (Listing[] memory) {
        uint256 listingsSize = _listingIdCounter.current();

        Listing[] memory listings = new Listing[](_activeListingsCount());
        uint256 a = 0;
        for (uint256 i = 0; i < listingsSize; i++) {
            Listing memory listing = _listingIdToListing[i];
            if (listing.isActive) {
                listings[a] = listing;
                a++;
            }
        }
        return listings;
    }

    function list(
        address _tokenContract,
        uint256 _tokenIdOffered,
        uint256 _tokenIdWanted
    ) external payable {
        require(
            _weAreApproved(_tokenContract, msg.sender),
            "Approval to transfer your tokens has to be given to this contract"
        );
        require(msg.value >= LISTING_FEE, "Not enough ETH to pay for listing");

        uint256 listingId = _listingIdCounter.current();
        _listingIdToListing[listingId] = Listing(
            listingId,
            true,
            _tokenContract,
            _tokenIdOffered,
            _tokenIdWanted,
            msg.sender
        );
        _listingIdCounter.increment();
    }

    function swap(uint256 _listingId) external payable {
        Listing storage listing = _listingIdToListing[_listingId];
        require(listing.tokenContract != address(0), "Invalid listingId");
        require(
            _weAreApproved(listing.tokenContract, msg.sender),
            "Approval to transfer your tokens has to be given to this contract"
        );
        require(msg.value >= SWAP_FEE, "Not enough ETH to pay for swaping");

        ERC1155(listing.tokenContract).safeTransferFrom(
            msg.sender,
            listing.publisher,
            listing.tokenIdWanted,
            1,
            ""
        );

        ERC1155(listing.tokenContract).safeTransferFrom(
            listing.publisher,
            msg.sender,
            listing.tokenIdOffered,
            1,
            ""
        );

        listing.isActive = false;
    }

    function _weAreApproved(address _contract, address _owner)
        private
        view
        returns (bool)
    {
        return ERC1155(_contract).isApprovedForAll(_owner, address(this));
    }

    function _activeListingsCount() private view returns (uint256) {
        uint256 listingsSize = _listingIdCounter.current();

        uint256 count = 0;
        for (uint256 i = 0; i < listingsSize; i++) {
            Listing memory listing = _listingIdToListing[i];
            if (listing.isActive) {
                count++;
            }
        }
        return count;
    }
}
