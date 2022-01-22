# non-fungible-albums contracts

This project is managed with [Hardhat](https://hardhat.org/)

## Tests

```
npx hardhat test
```

To report gas:
```
REPORT_GASE=true npx hardhat test
```

## Compile (generate ABI)

```
npx hardhat compile
```

Check `./artifacts/contracts/...`

## Deploy (Ropsten)

Fill environment variables
```bash
echo 'ROPSTEN_URL=xxx' >> .env
echo 'PRIVATE_KEY=xxx' >> .env
```

Deploy
```
npx hardhat --network ropsten run scripts/deploy.ts
```

Contract address will be printed in stdout

## Deploy (local)

```
npx hardhat run scripts/deploy.ts
```