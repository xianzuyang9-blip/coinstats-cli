export type CommandDefinition = {
  section: string;
  command: string;
  operationId: string;
  mutable?: boolean;
};

export const SECTION_DESCRIPTIONS: Record<string, string> = {
  coins: 'Coin market data commands',
  tickers: 'Ticker and exchange market commands',
  wallet: 'Wallet data and sync commands',
  exchange: 'Exchange connection commands',
  fiats: 'Supported fiat currency commands',
  nft: 'NFT data commands',
  news: 'News feed commands',
  markets: 'Global market data commands',
  portfolio: 'Portfolio data and mutation commands',
  currencies: 'Supported currency commands',
  insights: 'Market insights commands',
  usage: 'Usage and credit commands',
};

export const COMMANDS: CommandDefinition[] = [
  { section: 'coins', command: 'list', operationId: 'get-coins' },
  { section: 'coins', command: 'charts', operationId: 'get-coins-charts' },
  { section: 'coins', command: 'by-id', operationId: 'get-coin-by-id' },
  {
    section: 'coins',
    command: 'chart-by-id',
    operationId: 'get-coin-chart-by-id',
  },
  { section: 'coins', command: 'avg-price', operationId: 'get-coin-avg-price' },
  {
    section: 'coins',
    command: 'exchange-price',
    operationId: 'get-coin-exchange-price',
  },
  {
    section: 'tickers',
    command: 'exchanges',
    operationId: 'get-ticker-exchanges',
  },
  {
    section: 'tickers',
    command: 'markets',
    operationId: 'get-ticker-markets',
  },
  { section: 'wallet', command: 'blockchains', operationId: 'get-blockchains' },
  { section: 'wallet', command: 'balance', operationId: 'get-wallet-balance' },
  { section: 'wallet', command: 'balances', operationId: 'get-wallet-balances' },
  { section: 'wallet', command: 'status', operationId: 'get-wallet-sync-status' },
  {
    section: 'wallet',
    command: 'transactions',
    operationId: 'get-wallet-transactions',
  },
  {
    section: 'wallet',
    command: 'sync-transactions',
    operationId: 'transactions-sync',
    mutable: true,
  },
  { section: 'wallet', command: 'chart', operationId: 'wallet-chart' },
  { section: 'wallet', command: 'charts', operationId: 'wallet-charts' },
  { section: 'wallet', command: 'defi', operationId: 'get-wallet-defi' },
  { section: 'exchange', command: 'support', operationId: 'get-exchanges' },
  {
    section: 'exchange',
    command: 'balance',
    operationId: 'get-exchange-balance',
  },
  {
    section: 'exchange',
    command: 'status',
    operationId: 'get-exchange-sync-status',
  },
  {
    section: 'exchange',
    command: 'transactions',
    operationId: 'get-exchange-transactions',
  },
  {
    section: 'exchange',
    command: 'chart',
    operationId: 'get-exchange-chart',
  },
  {
    section: 'exchange',
    command: 'sync',
    operationId: 'exchange-sync-status',
    mutable: true,
  },
  { section: 'fiats', command: 'list', operationId: 'get-fiat-currencies' },
  { section: 'nft', command: 'trending', operationId: 'get-trending-nfts' },
  { section: 'nft', command: 'wallet-assets', operationId: 'get-nfts-by-wallet' },
  {
    section: 'nft',
    command: 'collection',
    operationId: 'get-nft-collection-by-address',
  },
  {
    section: 'nft',
    command: 'collection-assets',
    operationId: 'get-nft-collection-assets-by-address',
  },
  {
    section: 'nft',
    command: 'asset',
    operationId: 'get-nft-collection-asset-by-tokenid',
  },
  { section: 'news', command: 'sources', operationId: 'get-news-sources' },
  { section: 'news', command: 'list', operationId: 'get-news' },
  { section: 'news', command: 'by-type', operationId: 'get-news-by-type' },
  { section: 'news', command: 'by-id', operationId: 'get-news-by-id' },
  { section: 'markets', command: 'global', operationId: 'get-market-cap' },
  {
    section: 'portfolio',
    command: 'connect-wallet',
    operationId: 'connect-portfolio-wallet',
    mutable: true,
  },
  {
    section: 'portfolio',
    command: 'connect-exchange',
    operationId: 'connect-portfolio-exchange',
    mutable: true,
  },
  { section: 'portfolio', command: 'value', operationId: 'get-portfolio-value' },
  { section: 'portfolio', command: 'coins', operationId: 'get-portfolio-coins' },
  { section: 'portfolio', command: 'chart', operationId: 'get-portfolio-chart' },
  {
    section: 'portfolio',
    command: 'transactions',
    operationId: 'get-portfolio-transactions',
  },
  {
    section: 'portfolio',
    command: 'add-transaction',
    operationId: 'add-portfolio-transaction',
    mutable: true,
  },
  { section: 'portfolio', command: 'defi', operationId: 'get-portfolio-defi' },
  {
    section: 'portfolio',
    command: 'snapshot-items',
    operationId: 'get-portfolio-snapshot-items',
  },
  {
    section: 'portfolio',
    command: 'status',
    operationId: 'get-portfolio-sync-status',
  },
  {
    section: 'portfolio',
    command: 'sync',
    operationId: 'sync-portfolio',
    mutable: true,
  },
  {
    section: 'portfolio',
    command: 'delete',
    operationId: 'delete-portfolio',
    mutable: true,
  },
  { section: 'currencies', command: 'list', operationId: 'get-currencies' },
  {
    section: 'insights',
    command: 'btc-dominance',
    operationId: 'btc-dominance',
  },
  {
    section: 'insights',
    command: 'fear-and-greed',
    operationId: 'fear-and-greed',
  },
  {
    section: 'insights',
    command: 'fear-and-greed-chart',
    operationId: 'fear-and-greed-chart',
  },
  {
    section: 'insights',
    command: 'rainbow-chart',
    operationId: 'rainbow-chart',
  },
  { section: 'usage', command: 'credits', operationId: 'get-credit-usage' },
];

export const COMMANDS_BY_SECTION = COMMANDS.reduce<
  Record<string, CommandDefinition[]>
>((accumulator, command) => {
  accumulator[command.section] ??= [];
  accumulator[command.section].push(command);
  return accumulator;
}, {});

export function findCommand(section: string, command: string) {
  return COMMANDS.find(
    (entry) => entry.section === section && entry.command === command,
  );
}
