---
name: coinstats-markets
description: CoinStats market-wide data. Use when you need global market cap and high-level market metrics.
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

# CoinStats Markets

## Auth Setup

```bash
coinstats login --api-key <key>
```

## Commands

```bash
coinstats markets global --pretty
```
