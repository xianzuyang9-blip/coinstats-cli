---
name: coinstats-tickers
description: CoinStats ticker and exchange market discovery. Use when comparing exchange coverage and ticker markets.
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

# CoinStats Tickers

## Auth Setup

```bash
coinstats login --api-key <key>
```

## Commands

```bash
coinstats tickers exchanges --pretty
coinstats tickers markets --coin-id bitcoin --limit 20
```
