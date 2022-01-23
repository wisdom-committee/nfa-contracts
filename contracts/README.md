# non-fungible-albums contracts

This project is managed with [Hardhat](https://hardhat.org/)

## Run tests

```
npx hardhat test
```

To report gas:
```
REPORT_GASE=true npx hardhat test
```

To report gas in Polygon network:
```
REPORT_GAS=true REPORT_GAS_NETWORK=polygon npx hardhat test
```

(Optional) to see USD prices on gas reports:
```
echo 'COINMARKETCAP_APIKEY=xxx' >> .env
```

## Compile and generate ABI

```
npx hardhat compile
```

ABI will be at `./artifacts/contracts/NonFungibleAlbum.sol/NonFungibleAlbum.json`

## Deploy

### Local

```
npx hardhat run scripts/deploy.ts
```

### Ethereum Ropsten

Fill environment variables
```
echo 'ROPSTEN_URL=xxx' >> .env
echo 'PRIVATE_KEY=xxx' >> .env
```

Deploy
```
npx hardhat --network ropsten run scripts/deploy.ts
```

### Polygon Mumbai

Fill environment variables
```
echo 'MUMBAI_URL=xxx' >> .env
echo 'PRIVATE_KEY=xxx' >> .env
```

Deploy
```
npx hardhat --network mumbai run scripts/deploy.ts
```

