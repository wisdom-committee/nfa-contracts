require('dotenv').config();
const API_URL = process.env.ROPSTEN_URL;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);

const contract = require("../artifacts/contracts/Figurita.sol/Figurita.json");
const contractAddress = "0x6765F18a8f7a1c24F221aFfe8aB35935c3a00402";
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

uri = nftContract.methods.tokenURI(9).call((err, result) => {
    if (err){
        console.log(err);
    } else {
        console.log(result);
    }
})
