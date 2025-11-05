import React, { useState, useEffect } from 'react';
import {
  getStandardArray,
  computePointBuyCost,
  suggestPointBuyForClass,
  STAT_KEYS,
} from '../utils/ability_rules.js';

const ACTION_BTN =
  'px-3 py-1 border rounded bg-slate-700 text-white hover:bg-slate-600 transition';

const STAT_LABELS = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

export default function AbilitySelector({
  mode,
  setMode,
  rolls,
  setRolls,
  selectedClass,
  setIsAutoFilled,
  isAutoFilled,
}) {
  const POINTBUY_LIMIT = 27;
  const [pointsLeft, setPointsLeft] = useState(POINTBUY_LIMIT);

  useEffect(() => {
    if (mode === 'standard') {
      setRolls(getStandardArray());
      setIsAutoFilled?.([true, true, true, true, true, true]);
    } else if (mode === 'pointbuy') {
      setRolls([8, 8, 8, 8, 8, 8]);
      setIsAutoFilled?.([true, true, true, true, true, true]);
    } else if (mode === 'auto') {
      setIsAutoFilled?.([true, true, true, true, true, true]);
    } else if (mode === 'manual') {
      setIsAutoFilled?.([false, false, false, false, false, false]);
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'pointbuy') {
      const cost = computePointBuyCost(rolls.map(Number));
      setPointsLeft(POINTBUY_LIMIT - cost);
    }
  }, [rolls, mode]);

  const updateScore = (index, newScore) => {
    const val = Number(newScore);
    if (Number.isNaN(val)) return;
    if (val < 8 || val > 15) return;
    const newRolls = [...rolls];
    newRolls[index] = val;
    setRolls(newRolls);

    if (setIsAutoFilled) {
      const flags = [...isAutoFilled];
      flags[index] = false;
      setIsAutoFilled(flags);
    }
  };

  const applySuggestion = () => {
    const suggestion = suggestPointBuyForClass(selectedClass);
    if (!Array.isArray(suggestion) || suggestion.length !== 6) return;
    const newRolls = rolls.map((v, i) =>
      (isAutoFilled && isAutoFilled[i]) || v === 8 ? suggestion[i] : v
    );
    setRolls(newRolls);
    setIsAutoFilled?.(
      newRolls.map((v, i) =>
        (isAutoFilled && isAutoFilled[i]) || v === suggestion[i]
      )
    );
  };

  const clearPointBuy = () => {
    const baseline = [8, 8, 8, 8, 8, 8];
    setRolls(baseline);
    setIsAutoFilled?.(baseline.map(() => true));
  };

  const buttons = [
    { key: 'manual', label: 'Manual Input' },
    { key: 'standard', label: 'Standard Array' },
    { key: 'pointbuy', label: 'Point Buy' },
    { key: 'auto', label: 'Auto Roll' },
  ];

  return (
    <div>
      {/* Rules selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {buttons.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setMode(opt.key)}
            className={
              'px-3 py-1 rounded-full border transition ' +
              (mode === opt.key
                ? 'bg-slate-800 text-white font-bold border-slate-800'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Point Buy Mode */}
      {mode === 'pointbuy' && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button onClick={applySuggestion} className={ACTION_BTN}>
                Suggest for Class
              </button>
              <button onClick={clearPointBuy} className={ACTION_BTN}>
                Clear
              </button>
            </div>
            <div
              className={
                'text-sm ' +
                (pointsLeft < 0
                  ? 'text-red-500'
                  : 'text-slate-700 dark:text-slate-200')
              }
            >
              Points left: {pointsLeft} / {POINTBUY_LIMIT}
            </div>
          </div>

          {/* Restored Patch 0.81 design with extra spacing (mt-3) and full stat names */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {STAT_KEYS.map((stat, i) => (
              <div key={stat} className="relative flex items-center justify-between border p-2 rounded dark:border-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{STAT_LABELS[stat]}</span>
                </div>
                <input
                  type="number"
                  value={rolls[i]}
                  onChange={(e) => updateScore(i, e.target.value)}
                  className="w-16 text-center border rounded dark:border-slate-500 dark:bg-slate-700"
                  min={8}
                  max={15}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
