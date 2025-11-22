import React, { useState, useEffect, useMemo } from "react";
import AbilitySelector from "./components/AbilitySelector.jsx";
import { BACKGROUNDS } from "./data_backgrounds.js";
import { STAT_KEYS, getStandardArray } from "./utils/ability_rules.js";

/* Labels */
const STAT_LABELS = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma",
};

/* Class weights */
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

/* Helpers */
function roll4d6DropLowestDetailed() {
  const rolls = Array.from(
    { length: 4 },
    () => Math.floor(Math.random() * 6) + 1
  );
  const sorted = [...rolls].sort((a, b) => a - b);
  const dropped = sorted[0];
  const total = sorted.slice(1).reduce((s, v) => s + v, 0);
  return { total, rolls, dropped };
}

function modifier(score) {
  return Math.floor((score - 10) / 2);
}

function permutations(arr) {
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return [arr.slice()];
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1));
    for (const p of permutations(rest)) res.push([arr[i], ...p]);
  }
  return res;
}

export default function BackgroundOptimizer() {
  const [mode, setMode] = useState("manual"); // manual | auto | standard | pointbuy
  const [rolls, setRolls] = useState(["", "", "", "", "", ""]);
  const [breakdowns, setBreakdowns] = useState([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [isAutoFilled, setIsAutoFilled] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [background, setBackground] = useState(null);
  const [bgMode, setBgMode] = useState("+2/+1"); // or "+1/+1/+1"
  const [choices, setChoices] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("dnd_theme") || "dark";
    } catch {
      return "dark";
    }
  });
  const [hoverIndex, setHoverIndex] = useState(null);

  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("dnd_theme", theme);
    } catch {}
  }, [isDark, theme]);

  // Initialize/reset behavior when switching modes
  useEffect(() => {
    if (mode === "manual") {
      setRolls(["", "", "", "", "", ""]);
      setBreakdowns([null, null, null, null, null, null]);
      setIsAutoFilled([false, false, false, false, false, false]);
    } else if (mode === "standard") {
      setRolls(getStandardArray());
      setIsAutoFilled([true, true, true, true, true, true]);
    } else if (mode === "pointbuy") {
      setRolls([8, 8, 8, 8, 8, 8]);
      setIsAutoFilled([true, true, true, true, true, true]);
    }
  }, [mode]);

  const allowed = background
    ? BACKGROUNDS[background]?.abilities || STAT_KEYS
    : STAT_KEYS;

  const toggleChoice = (s) => {
    setChoices((prev) => {
      const next = [...prev];
      const idx = next.indexOf(s);
      if (idx >= 0) next.splice(idx, 1);
      else {
        const limit = bgMode === "+2/+1" ? 2 : 3;
        if (next.length < limit && allowed.includes(s)) next.push(s);
      }
      return next;
    });
  };

  const applyBackgroundToAssign = (assignment) => {
    const out = { ...assignment };
    if (!background) return out;
    if (bgMode === "+2/+1") {
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
    if (nums.some((n) => isNaN(n))) {
      return { error: "Enter six numeric rolls or switch to a valid mode." };
    }

    const perms = permutations(nums);
    const results = CLASS_DATA.map((cls) => {
      let best = { score: -Infinity, assign: null };
      for (const p of perms) {
        const assign = {};
        STAT_KEYS.forEach((s, i) => (assign[s] = p[i]));
        const withBg = applyBackgroundToAssign(assign);
        let sc = 0;
        for (const s of STAT_KEYS) {
          sc += (withBg[s] || assign[s] || 0) * (cls.weights[s] || 0);
        }
        if (sc > best.score) best = { score: sc, assign: assign };
      }
      return { className: cls.name, score: best.score, assign: best.assign };
    });

    results.sort((a, b) => a.className.localeCompare(b.className));
    return { results };
  }, [rolls, background, bgMode, choices]);

  const updateRoll = (i, val) => {
    const copy = [...rolls];
    copy[i] = val === "" ? "" : Number(val);
    setRolls(copy);
    setIsAutoFilled((prev) => {
      const out = [...prev];
      out[i] = false;
      return out;
    });
  };

  const rerollIndex = (i) => {
    const d = roll4d6DropLowestDetailed();
    const r = [...rolls];
    r[i] = d.total;
    const b = [...breakdowns];
    b[i] = d;
    setRolls(r);
    setBreakdowns(b);
    setIsAutoFilled((prev) => {
      const copy = [...prev];
      copy[i] = true;
      return copy;
    });
  };

  const rerollAll = () => {
    const totals = [];
    const b = [];
    for (let i = 0; i < 6; i++) {
      const d = roll4d6DropLowestDetailed();
      totals.push(d.total);
      b.push(d);
    }
    setRolls(totals);
    setBreakdowns(b);
    setIsAutoFilled([true, true, true, true, true, true]);
    setMode("auto");
  };

  const clearBackground = () => {
    setBackground(null);
    setChoices([]);
  };

  const normalizedMode =
    typeof mode === "string" ? mode.trim().toLowerCase() : "";

  const borderStat = isDark ? "border-slate-600" : "border-gray-300";
  const panelBg = isDark ? "bg-slate-800" : "bg-gray-50";
  const mainBg = isDark
    ? "bg-slate-900 text-slate-200"
    : "bg-white text-slate-900";

  const actionBtn =
    "px-3 py-1 border rounded bg-slate-700 text-white hover:bg-slate-600 transition";

  return (
    <div
      className={`min-h-screen flex items-start justify-center p-8 ${
        isDark ? "bg-slate-900" : "bg-gray-100"
      }`}
    >
      <div className={`w-full max-w-6xl p-6 rounded shadow ${mainBg}`}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              D&D 2024 — Classes Optimizer
            </h1>
            <p
              className={`text-sm mb-4 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Use this tool to compare how your rolled stats and background
              bonuses fit every class for early-game play.
            </p>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-1 rounded-full border ${
                theme === "light"
                  ? "bg-white font-bold"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-1 rounded-full border ${
                theme === "dark"
                  ? "bg-white text-slate-800 font-bold"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Layout:
            - mobile: 1 col
            - tablet: 2 cols (Rules + Classes), details below spanning both
            - desktop: 3 cols with ratios 2.2 / 1.4 / 0.9
        */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch cols-md-weights">
          {/* Left column: Rules / Rolls / PointBuy / Background */}
          <div
            className={`p-4 rounded ${panelBg} flex flex-col border ${borderStat}`}
          >
            <AbilitySelector
              mode={mode}
              setMode={setMode}
              rolls={rolls}
              setRolls={setRolls}
              selectedClass={selectedClass}
              isAutoFilled={isAutoFilled}
              setIsAutoFilled={setIsAutoFilled}
            />

            {/* Auto Roll / Clear row (hidden if pointbuy) */}
            {normalizedMode !== "pointbuy" &&
              (mode === "manual" || mode === "auto" || mode === "standard") && (
                <div className="mt-1 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <button onClick={rerollAll} className={actionBtn}>
                        Auto Roll
                      </button>
                      <button
                        onClick={() => {
                          setRolls(["", "", "", "", "", ""]);
                          setBreakdowns([null, null, null, null, null, null]);
                          setIsAutoFilled([
                            false,
                            false,
                            false,
                            false,
                            false,
                            false,
                          ]);
                        }}
                        className={actionBtn}
                      >
                        Clear
                      </button>
                    </div>
                    <div className="text-sm">&nbsp;</div>
                  </div>
                </div>
              )}

            {/* Results (hidden when pointbuy is active) */}
            {normalizedMode !== "pointbuy" && (
              <>
                <h2 className="font-semibold">Results</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {rolls.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 relative"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      <input
                        className={`w-20 p-2 border rounded text-center ${borderStat} ${
                          isDark
                            ? "bg-slate-700 text-slate-200"
                            : "bg-white text-slate-900"
                        }`}
                        value={r}
                        onChange={(e) => updateRoll(i, e.target.value)}
                        disabled={mode === "auto" || mode === "standard"}
                      />
                      {mode !== "standard" && mode !== "pointbuy" && (
                        <button
                          className="px-2 py-1 border rounded text-xs bg-slate-700 text-white hover:bg-slate-600 transition"
                          onClick={() => rerollIndex(i)}
                        >
                          Roll
                        </button>
                      )}

                      {/* Tooltip breakdown when available and in auto mode */}
                      {mode === "auto" && breakdowns[i] && hoverIndex === i && (
                        <div className="absolute z-20 -top-14 left-0 w-max p-2 bg-slate-700 text-slate-200 border rounded shadow">
                          <div className="text-xs font-medium">
                            Roll breakdown
                          </div>
                          <div className="mt-1 text-sm">
                            {breakdowns[i].rolls.map((v, idx) => (
                              <span
                                key={idx}
                                className={
                                  v === breakdowns[i].dropped
                                    ? "line-through opacity-80 mr-1"
                                    : "mr-1"
                                }
                              >
                                {v}
                              </span>
                            ))}
                            <div className="text-xs text-slate-400 mt-1">
                              Dropped: {breakdowns[i].dropped}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Background controls */}
            <div className="mt-4">
              <h3 className="font-medium">Background</h3>
              <div className="mt-2">
                <select
                  value={background || ""}
                  onChange={(e) => {
                    setBackground(e.target.value || null);
                    setChoices([]);
                  }}
                  className={`w-full border rounded p-2 ${
                    isDark
                      ? "bg-slate-700 text-slate-200"
                      : "bg-white text-slate-900"
                  }`}
                >
                  <option value="">— Choose Background —</option>
                  {Object.keys(BACKGROUNDS).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <div className="mt-2">
                  <button onClick={clearBackground} className={actionBtn}>
                    Clear Background
                  </button>
                </div>

                {background && (
                  <div className="mt-2">
                    <div className="text-sm">
                      Mode:
                      <select
                        value={bgMode}
                        onChange={(e) => {
                          setBgMode(e.target.value);
                          setChoices([]);
                        }}
                        className="ml-2 border rounded p-1 bg-slate-700 text-slate-200"
                      >
                        <option value="+2/+1">+2 / +1</option>
                        <option value="+1/+1/+1">+1 / +1 / +1</option>
                      </select>
                    </div>

                    <div className="mt-2 text-sm">
                      Allowed: {allowed.map((a) => STAT_LABELS[a]).join(", ")}
                    </div>

                    <div className="mt-2 flex gap-2 flex-wrap">
                      {allowed.map((s) => (
                        <button
                          key={s}
                          onClick={() => toggleChoice(s)}
                          className={`px-3 py-1 border rounded ${
                            choices.includes(s)
                              ? isDark
                                ? "bg-slate-700 text-white"
                                : "bg-gray-200 text-slate-900"
                              : ""
                          }`}
                        >
                          {STAT_LABELS[s]}
                        </button>
                      ))}
                    </div>

                    <div
                      className="mt-1 text-xs"
                      style={{
                        color: isDark
                          ? "rgba(203,213,225,0.8)"
                          : "rgba(75,85,99,0.8)",
                      }}
                    >
                      Selected:{" "}
                      {choices.map((c) => STAT_LABELS[c]).join(", ") || "—"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle column: Classes */}
          <div
            className={`p-4 rounded ${panelBg} h-full flex flex-col border ${borderStat}`}
          >
            <h2 className="font-semibold">Classes</h2>
            <div className="mt-3 space-y-2 overflow-auto pr-2 flex-1">
              {!compute.results && (
                <div
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Enter rolls or use Auto Roll to compute.
                </div>
              )}
              {compute.results &&
                compute.results.map((r) => (
                  <div
                    key={r.className}
                    onClick={() => setSelectedClass(r.className)}
                    className={`p-3 rounded border cursor-pointer ${
                      selectedClass === r.className
                        ? isDark
                          ? "bg-slate-700 border-slate-500 text-white"
                          : "bg-gray-100 border-gray-300"
                        : isDark
                        ? "bg-slate-800 border-slate-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="font-medium">{r.className}</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right column: Selected class details
              - sm: span 2 cols (below)
              - md+: 1 col (third column)
          */}
          <div
            className={`p-4 rounded ${panelBg} border ${borderStat} sm:col-span-2 md:col-span-1`}
          >
            <h2 className="font-semibold">Selected class details</h2>
            <div className="mt-3">
              {!selectedClass && (
                <div
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Click a class to view its optimized assignment.
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
                      {/* Mobile: vertical; tablet: 6 across; desktop: vertical again */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 md:grid-cols-1 gap-3">
                        {STAT_KEYS.map((s) => (
                          <div
                            key={s}
                            className={`p-2 border rounded text-center ${borderStat}`}
                          >
                            <div className="text-xs text-slate-400">
                              {STAT_LABELS[s]}
                            </div>
                            <div className="text-xl font-semibold font-mono">
                              {applied[s]}
                            </div>
                            <div className="text-4xl">
                              {modifier(applied[s]) > 0
                                ? "+" + modifier(applied[s])
                                : modifier(applied[s])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>

        {/* Desktop & tablet column rules */}
        <style>{`
          @media (min-width: 768px) {
            .cols-md-weights {
              grid-template-columns: 2.2fr 1.4fr 0.9fr !important;
            }
          }
          @media (min-width: 640px) and (max-width: 767px) {
            .cols-md-weights {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
