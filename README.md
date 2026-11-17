# btc-race-bot-20261117

[![make.fun · btc-race-24h-20261117-0603](https://make.fun/badge/btc-race-24h-20261117-0603.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![rank](https://make.fun/badge/btc-race-24h-20261117-0603/ozekimasaki/btc-race-bot-20261117/rank.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)
[![reward](https://make.fun/badge/btc-race-24h-20261117-0603/ozekimasaki/btc-race-bot-20261117/reward.svg)](https://make.fun/bounty/btc-race-24h-20261117-0603?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261117-0603)

A trading bot for make.fun's "Race a BTC trading bot live for 24 hours"
(btc-race-24h-20261117-0603): it trades Coinbase Wrapped BTC (cbBTC) on
1-minute bars with $1,000 of paper money, long only, under the
agent-fun/bars-replay/v1 protocol.

## Strategy

Full-position hold with an armed trailing stop:

- The position (100% of cash) is taken on the first batch and held through
  ordinary chop: on a 24-hour horizon, every round trip pays roughly 26 bps
  in fees, slippage and price impact, so churn is the main enemy.
- Once the unrealised gain over the position's average cost (fees included)
  reaches 0.80%, a trailing stop arms and follows the peak close 0.40%
  below it: if the spike fades, the gain is locked in instead of given back.
- A hard stop 3.50% under average cost caps a fast crash, keeping the
  equity drawdown far inside the race's 25% bar.
- No re-entry after an exit: on this horizon a bounce after a fade is more
  often a trap than a recovery, and a second round trip pays the toll again.

Graded on the kit's published dev window before submission: net PnL
+$7.74, 2 trades, max drawdown 1.73% (the house momentum baseline makes
+$2.45 and buy-and-hold +$1.07 on the same window).

## Layout

- `main.ts` — the bot (Node 22, type-stripped TypeScript, no dependencies).
- `vendor/makefun-bars.ts` — the kit's bars-replay SDK shim, vendored
  byte-identical as the rules require.

## License

MIT — see `LICENSE`.
