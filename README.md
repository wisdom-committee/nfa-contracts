# non-fungible-albums contracts

This project is managed with [Hardhat](https://hardhat.org/)

## Compile (generate ABI)

```
npx hardhat compile
```

Check `./artifacts/contracts/...`

## Deploy

Fill environment variables
```bash
echo 'ROPSTEN_URL=xxx' >> .env
echo 'PRIVATE_KEY=xxx' >> .env
```

Deploy
```
npx hardhat --network ropsten run scripts/deploy.ts
```

## Play around

Mint stickers
```
node scripts/mint-nft.js
```

Read sticker
```
node scripts/read-nft.js
```