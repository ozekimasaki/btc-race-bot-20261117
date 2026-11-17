import { runBars, type OrderInput } from './vendor/makefun-bars.ts';

// Full-position hold with an armed trailing stop. The position is taken on
// the first batch and held through ordinary chop; once the unrealised gain
// over the position's average cost reaches ARM_BPS, a trailing stop follows
// the peak close TRAIL_BPS below it and locks the spike in if it fades. A
// hard stop STOP_BPS under average cost caps a fast crash. Optionally the
// bot re-enters once if, after a trailing exit, the close makes a new high
// over the exit reference (the recovery is real, not a dead bounce).
const ARM_BPS = 80;
const TRAIL_BPS = 40;
const STOP_BPS = 350;
const REENTER = 0;
const SIZE_NUM = 100;
const SIZE_DEN = 100;
const MAX_SLIP = 200;

let peak = 0n;
let armed = false;
let wasHolding = false;
let exitRef = 0n;
let postExitHigh = 0n;
let reentered = false;
let trailExit = false;

await runBars({
  onBatch(state, batch): OrderInput[] {
    const sym = state.hello.symbols[0].symbol;
    const c = state.close(sym);
    if (c === null) return [];
    if (state.warmingUp) return [];
    const pos = state.positions.get(sym);
    const holding = pos !== undefined && pos.qty > 0n;
    if (holding && pos) {
      if (!wasHolding) {
        peak = c;
        armed = false;
      } else if (c > peak) {
        peak = c;
      }
      const avgCost = (pos.cost * 10000000n) / pos.qty;
      if (!armed && peak * 10000n >= avgCost * BigInt(10000 + ARM_BPS)) armed = true;
      let exit = false;
      if (armed && c * 10000n <= peak * BigInt(10000 - TRAIL_BPS)) exit = true;
      if (c * 10000n <= avgCost * BigInt(10000 - STOP_BPS)) exit = true;
      wasHolding = true;
      if (exit) {
        trailExit = armed;
        exitRef = c;
        postExitHigh = c;
        return [{ side: 'sell', symbol: sym, qty: pos.qty, max_slippage_bps: MAX_SLIP }];
      }
      return [];
    }
    wasHolding = false;
    // flat
    if (exitRef > 0n) {
      if (c > postExitHigh) postExitHigh = c;
      if (!(REENTER === 1 && trailExit && !reentered && postExitHigh * 10000n > exitRef * 10050n)) {
        return [];
      }
      reentered = true;
    }
    let notional = (state.cash * BigInt(SIZE_NUM)) / BigInt(SIZE_DEN);
    const room = state.weightRoom(sym);
    if (room < notional) notional = room;
    const minNotional = BigInt(state.hello.fees.min_notional_quote_units);
    if (notional >= minNotional && notional >= 50000000n) {
      return [{ side: 'buy', symbol: sym, notional_quote_units: notional, max_slippage_bps: MAX_SLIP }];
    }
    return [];
  },
});
