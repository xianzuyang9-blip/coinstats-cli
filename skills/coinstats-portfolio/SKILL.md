---
name: coinstats-portfolio
description: CoinStats portfolio commands. Use when checking portfolio value, holdings, charts, transactions, sync status, or managing portfolio connections.
metadata:
  openclaw:
    requires:
      env:
        - COINSTATS_API_KEY
      bins:
        - coinstats
    primaryEnv: COINSTATS_API_KEY
    install:
      - kind: node
        package: coinstats-cli
        bins: [coinstats]
allowed-tools: Bash(coinstats:*)
---

# CoinStats Portfolio

## Auth Setup

```bash
coinstats login --api-key <key>
```

## Commands

```bash
coinstats portfolio value --portfolio-id <id>
coinstats portfolio coins --portfolio-id <id>
coinstats portfolio chart --portfolio-id <id>
coinstats portfolio connect-wallet --body-file ./wallet.json --yes
coinstats portfolio add-transaction --body-file ./transaction.json --yes
coinstats portfolio sync --portfolio-id <id> --yes
coinstats portfolio delete --portfolio-id <id> --yes
```
