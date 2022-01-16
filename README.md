# non-fungible-albums contracts

This project is managed with [Hardhat](https://hardhat.org/)

## Setup

Fill environment variables
```bash
echo 'ROPSTEN_URL=xxx' >> .env
echo 'PRIVATE_KEY=xxx' >> .env
```

## Deploy

```
npx hardhat --network ropsten run scripts/deploy.ts
```

## Play around

Mint figurita
```
node scripts/mint-nft.js
```

Read figurita
```
node scripts/read-nft.js
```