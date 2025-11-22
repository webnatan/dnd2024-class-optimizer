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
export function suggestPointBuyForClass(priority) {
  const KEYS = ["STR","DEX","CON","INT","WIS","CHA"];
  const STANDARD = [15,14,13,12,10,8];
  const prio = Array.isArray(priority) ? priority.slice(0, 3) : [];
  const remaining = KEYS.filter(k => !prio.includes(k));
  const order = prio.concat(remaining); // first 3 get 15,14,13; rest get 12,10,8
  const scores = {};
  for (let i = 0; i < order.length; i++) {
    scores[order[i]] = STANDARD[i];
  }
  return KEYS.map(k => scores[k]);
}
