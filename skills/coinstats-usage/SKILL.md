---
name: coinstats-usage
description: CoinStats credit and usage commands. Use when checking remaining credits or validating that an API key works.
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

# CoinStats Usage

## Auth Setup

```bash
coinstats login --api-key <key>
```

## Commands

```bash
coinstats usage credits --pretty
coinstats whoami
```
