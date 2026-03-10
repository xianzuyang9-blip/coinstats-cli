# CoinStats CLI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Command-line interface for the CoinStats Public API, designed for AI agents and terminal-first workflows.

## Install

```bash
npm install -g coinstats-cli
npx skills add CoinStatsHQ/coinstats-cli
```

## Auth

```bash
coinstats login --api-key <your-api-key>
export COINSTATS_API_KEY=<your-api-key>
```

Environment variables take priority over the saved config in `~/.coinstats/config.json`.

## Command Groups

```bash
coinstats coins <command>
coinstats tickers <command>
coinstats wallet <command>
coinstats exchange <command>
coinstats fiats <command>
coinstats nft <command>
coinstats news <command>
coinstats markets <command>
coinstats portfolio <command>
coinstats currencies <command>
coinstats insights <command>
coinstats usage <command>
coinstats schema --pretty
```

The CLI currently maps all 52 public operations in the published CoinStats OpenAPI snapshot.

## Output

Default output is machine-friendly JSON:

```json
{"success":true,"data":{}}
{"success":false,"error":"message","code":"ERROR_CODE","status":400}
```

Supported output controls:

- `--pretty`
- `--table`
- `--format json|csv`
- `--fields id,name,price`

Mutating commands require `--yes`.

## Examples

```bash
coinstats coins list --limit 5 --pretty
coinstats insights fear-and-greed --pretty
coinstats wallet sync-transactions --blockchain ethereum --body-file ./wallet-sync.json --yes
coinstats portfolio connect-wallet --body-file ./wallet.json --yes
coinstats exchange sync --portfolio-id <id> --yes
coinstats schema --pretty
```

## Skills

This repo ships section-based skills under `skills/`:

- `coinstats-coins`
- `coinstats-tickers`
- `coinstats-wallet`
- `coinstats-exchange`
- `coinstats-fiats`
- `coinstats-nft`
- `coinstats-news`
- `coinstats-markets`
- `coinstats-portfolio`
- `coinstats-currencies`
- `coinstats-insights`
- `coinstats-usage`

## Development

```bash
npm install
npm run generate:client
npm run build
npm test
npm run lint
npm run check:coverage
```

Generated SDK source lives in `src/generated/`. The OpenAPI snapshot lives in `openapi/coinstats-public-api.json`.
