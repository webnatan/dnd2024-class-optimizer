import React, { useState, useMemo, useEffect } from "react";
import { BACKGROUNDS } from "./data_backgrounds.js";

const STATS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const CLASS_DATA = [
  {
    name: "Barbarian",
    weights: { STR: 5, DEX: 2, CON: 4, INT: 0, WIS: 1, CHA: 0 },
  },
  {
    name: "Fighter",
    weights: { STR: 4, DEX: 3, CON: 4, INT: 1, WIS: 1, CHA: 0 },
  },
  {
    name: "Paladin",
    weights: { STR: 4, DEX: 0, CON: 3, INT: 0, WIS: 1, CHA: 5 },
  },
  {
    name: "Ranger",
    weights: { STR: 2, DEX: 5, CON: 3, INT: 1, WIS: 4, CHA: 0 },
  },
  {
    name: "Rogue",
    weights: { STR: 0, DEX: 6, CON: 2, INT: 2, WIS: 1, CHA: 1 },
  },
  { name: "Monk", weights: { STR: 1, DEX: 5, CON: 3, INT: 1, WIS: 4, CHA: 0 } },
  {
    name: "Wizard",
    weights: { STR: 0, DEX: 2, CON: 3, INT: 6, WIS: 1, CHA: 0 },
  },
  {
    name: "Sorcerer",
    weights: { STR: 0, DEX: 1, CON: 3, INT: 0, WIS: 0, CHA: 6 },
  },
  {
    name: "Warlock",
    weights: { STR: 0, DEX: 1, CON: 3, INT: 0, WIS: 0, CHA: 6 },
  },
  { name: "Bard", weights: { STR: 0, DEX: 2, CON: 2, INT: 1, WIS: 1, CHA: 5 } },
  {
    name: "Cleric",
    weights: { STR: 1, DEX: 1, CON: 3, INT: 0, WIS: 5, CHA: 2 },
  },
  {
    name: "Druid",
    weights: { STR: 0, DEX: 2, CON: 3, INT: 1, WIS: 5, CHA: 1 },
  },
];

function roll4d6DropLowest() {
  const r = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
  r.sort((a, b) => a - b);
  return r.slice(1).reduce((s, v) => s + v, 0);
}
function modifier(score) {
  return Math.floor((score - 10) / 2);
}

function permutations(arr) {
  if (arr.length === 0) return [[]];
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) res.push([arr[i], ...p]);
  }
  return res;
}

export default function BackgroundOptimizer() {
  const [rolls, setRolls] = useState(["", "", "", "", "", ""]);
  const [useAuto, setUseAuto] = useState(true);
  const [background, setBackground] = useState(null);
  const [mode, setMode] = useState("+2/+1");
  const [choices, setChoices] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    if (useAuto) {
      const rs = Array.from({ length: 6 }, () => roll4d6DropLowest());
      setRolls(rs);
    }
  }, [useAuto]);

  const updateRoll = (i, val) => {
    const copy = [...rolls];
    copy[i] = val;
    setRolls(copy);
  };

  const allowed = background
    ? BACKGROUNDS[background]?.abilities || STATS
    : STATS;

  const toggleChoice = (s) => {
    setChoices((prev) => {
      const next = [...prev];
      if (next.includes(s)) next.splice(next.indexOf(s), 1);
      else {
        const limit = mode === "+2/+1" ? 2 : 3;
        if (next.length < limit && allowed.includes(s)) next.push(s);
      }
      return next;
    });
  };

  const applyBackgroundToAssign = (assignment) => {
    const out = { ...assignment };
    if (!background) return out;
    if (mode === "+2/+1") {
      const [a, b] = choices;
      if (a) out[a] = (out[a] || 0) + 2;
      if (b) out[b] = (out[b] || 0) + 1;
    } else {
      choices.slice(0, 3).forEach((s) => {
        if (s) out[s] = (out[s] || 0) + 1;
      });
    }
    return out;
  };

  const compute = useMemo(() => {
    const nums = rolls.map(Number);
    if (nums.some((n) => isNaN(n)))
      return { error: "Enter six numeric rolls or switch to Auto mode." };
    const perms = permutations(nums);
    const results = CLASS_DATA.map((cls) => {
      let best = { score: -Infinity, assign: null };
      for (const p of perms) {
        const assign = {};
        STATS.forEach((s, i) => (assign[s] = p[i]));
        const withBg = applyBackgroundToAssign(assign);
        let sc = 0;
        for (const s of STATS)
          sc += (withBg[s] || assign[s] || 0) * (cls.weights[s] || 0);
        if (sc > best.score) {
          best = { score: sc, assign: assign };
        }
      }
      return { className: cls.name, score: best.score, assign: best.assign };
    });
    results.sort((a, b) => a.className.localeCompare(b.className));
    return { results };
  }, [rolls, background, mode, choices]);

  const clearBackground = () => {
    setBackground(null);
    setChoices([]);
  };

  return (
    <div className="w-full max-w-5xl bg-white p-6 rounded shadow">
      <div>
        <h1 className="text-2xl font-bold mb-2">
          D&D 2024 — Classes Optimizer
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          Use this tool to compare how your rolled stats and background bonuses
          fit every class for early-game play (levels 1–3). The background
          feature is optional and can be changed anytime to test different
          backgrounds, but no ability score improvements or custom bonuses are
          included.
        </p>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          {/* Styled radio-like toggle pills inside Rolls container */}
          <div className="flex items-center gap-3 mb-3">
            <label
              role="radio"
              aria-checked={useAuto}
              onClick={() => setUseAuto(true)}
              className={`px-3 py-1 rounded-full border cursor-pointer select-none transition ${
                useAuto
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="inputMode"
                className="sr-only"
                checked={useAuto}
                onChange={() => setUseAuto(true)}
              />
              Auto Rolls
            </label>

            <label
              role="radio"
              aria-checked={!useAuto}
              onClick={() => setUseAuto(false)}
              className={`px-3 py-1 rounded-full border cursor-pointer select-none transition ${
                !useAuto
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              <input
                type="radio"
                name="inputMode"
                className="sr-only"
                checked={!useAuto}
                onChange={() => setUseAuto(false)}
              />
              Manual Input
            </label>
          </div>

          <h2 className="font-semibold">Rolls</h2>
          <div className="mt-2 flex gap-2 items-center">
            <button
              onClick={() => {
                const rs = Array.from({ length: 6 }, () => roll4d6DropLowest());
                setRolls(rs);
              }}
              className="px-3 py-1 border rounded"
            >
              Auto Rolls
            </button>
            <button
              onClick={() => setRolls(["", "", "", "", "", ""])}
              className="px-3 py-1 border rounded"
            >
              Clear
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {rolls.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="w-20 p-2 border rounded text-center"
                  value={r}
                  onChange={(e) => updateRoll(i, e.target.value)}
                  disabled={useAuto}
                />
                <button
                  className="px-2 py-1 border rounded text-xs"
                  onClick={() => {
                    const c = [...rolls];
                    c[i] = roll4d6DropLowest();
                    setRolls(c);
                  }}
                >
                  Roll
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Background</h3>
            <div className="mt-2">
              <select
                value={background || ""}
                onChange={(e) => {
                  setBackground(e.target.value || null);
                  setChoices([]);
                }}
                className="w-full border rounded p-2"
              >
                <option value="">— Choose Background —</option>
                {Object.keys(BACKGROUNDS).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>

              <div className="mt-2">
                <button
                  onClick={clearBackground}
                  className="px-3 py-1 border rounded"
                >
                  Clear Background
                </button>
              </div>

              {background && (
                <div className="mt-2">
                  <div className="text-sm text-slate-700">
                    Mode:
                    <select
                      value={mode}
                      onChange={(e) => {
                        setMode(e.target.value);
                        setChoices([]);
                      }}
                      className="ml-2 border rounded p-1"
                    >
                      <option value="+2/+1">+2 / +1</option>
                      <option value="+1/+1/+1">+1 / +1 / +1</option>
                    </select>
                  </div>
                  <div className="mt-2 text-sm">
                    Allowed: {allowed.join(", ")}
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {allowed.map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleChoice(s)}
                        className={
                          "px-3 py-1 border rounded " +
                          (choices.includes(s) ? "bg-slate-700 text-white" : "")
                        }
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Selected: {choices.join(", ") || "—"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Classes</h2>
          <div className="mt-3 space-y-2 max-h-[480px] overflow-auto">
            {!compute.results && (
              <div className="text-sm text-slate-500">
                Enter rolls or use Auto Rolls to compute.
              </div>
            )}
            {compute.results &&
              compute.results.map((r) => (
                <div
                  key={r.className}
                  onClick={() => setSelectedClass(r.className)}
                  className={
                    "p-3 rounded border cursor-pointer flex justify-between items-center " +
                    (selectedClass === r.className
                      ? "bg-slate-100 border-slate-400"
                      : "bg-white")
                  }
                >
                  <div>
                    <div className="font-medium">{r.className}</div>
                  </div>
                  <div className="text-xs text-slate-400">view</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded">
        <h2 className="font-semibold">Selected class details</h2>
        <div className="mt-3">
          {!selectedClass && (
            <div className="text-sm text-slate-500">
              Click a class on the right to view its optimized assignment.
            </div>
          )}
          {selectedClass &&
            compute.results &&
            (() => {
              const r = compute.results.find(
                (x) => x.className === selectedClass
              );
              if (!r) return <div className="text-sm">No data</div>;
              const applied = applyBackgroundToAssign(r.assign);
              return (
                <div>
                  <div className="mb-2 font-semibold">{r.className}</div>
                  <div className="grid grid-cols-6 gap-2">
                    {STATS.map((s) => (
                      <div key={s} className="p-2 border rounded text-center">
                        <div className="text-xs text-slate-500">{s}</div>
                        <div className="font-mono">{applied[s]}</div>
                        <div className="text-lg font-bold">
                          {modifier(applied[s])}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <button
                      className="px-3 py-1 border rounded"
                      onClick={() => {
                        const w = window.open("about:blank");
                        const rows = STATS.map(
                          (s) =>
                            `<tr><td>${s}</td><td>${applied[s]} (${modifier(
                              applied[s]
                            )})</td></tr>`
                        ).join("");
                        const html = `<html><body><h2>${r.className}</h2><table border=1>${rows}</table></body></html>`;
                        w.document.write(html);
                        w.document.close();
                      }}
                    >
                      Print Sheet
                    </button>
                  </div>
                </div>
              );
            })()}
        </div>
      </div>
    </div>
  );
}
