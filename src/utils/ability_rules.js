export const STAT_KEYS = ["STR","DEX","CON","INT","WIS","CHA"];

export function getStandardArray() { return [15,14,13,12,10,8]; }
export function pointBuyCostForScore(score) {
  const costTable = {8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
  return costTable[score] ?? Infinity;
}
export function computePointBuyCost(scores) {
  return scores.reduce((s,x)=>s+pointBuyCostForScore(Number(x)),0);
}
export function validatePointBuy(scores, limit=27) { return computePointBuyCost(scores) <= limit; }
export function suggestPointBuyForClass(className) { return [15,14,13,12,10,8]; }
