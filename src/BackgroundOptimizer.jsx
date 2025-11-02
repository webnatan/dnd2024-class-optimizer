import React, { useState, useEffect, useMemo } from "react";
import { BACKGROUNDS } from "./data_backgrounds.js";

const STAT_KEYS = ["STR","DEX","CON","INT","WIS","CHA"];
const STAT_LABELS = {
  STR: "Strength",
  DEX: "Dexterity",
  CON: "Constitution",
  INT: "Intelligence",
  WIS: "Wisdom",
  CHA: "Charisma"
};

const CLASS_DATA = [
  { name:"Barbarian", weights:{STR:5,DEX:2,CON:4,INT:0,WIS:1,CHA:0} },
  { name:"Fighter", weights:{STR:4,DEX:3,CON:4,INT:1,WIS:1,CHA:0} },
  { name:"Paladin", weights:{STR:4,DEX:0,CON:3,INT:0,WIS:1,CHA:5} },
  { name:"Ranger", weights:{STR:2,DEX:5,CON:3,INT:1,WIS:4,CHA:0} },
  { name:"Rogue", weights:{STR:0,DEX:6,CON:2,INT:2,WIS:1,CHA:1} },
  { name:"Monk", weights:{STR:1,DEX:5,CON:3,INT:1,WIS:4,CHA:0} },
  { name:"Wizard", weights:{STR:0,DEX:2,CON:3,INT:6,WIS:1,CHA:0} },
  { name:"Sorcerer", weights:{STR:0,DEX:1,CON:3,INT:0,WIS:0,CHA:6} },
  { name:"Warlock", weights:{STR:0,DEX:1,CON:3,INT:0,WIS:0,CHA:6} },
  { name:"Bard", weights:{STR:0,DEX:2,CON:2,INT:1,WIS:1,CHA:5} },
  { name:"Cleric", weights:{STR:1,DEX:1,CON:3,INT:0,WIS:5,CHA:2} },
  { name:"Druid", weights:{STR:0,DEX:2,CON:3,INT:1,WIS:5,CHA:1} }
];

function roll4d6DropLowestDetailed(){
  const rolls = Array.from({length:4},()=>Math.floor(Math.random()*6)+1);
  const sorted = [...rolls].sort((a,b)=>a-b);
  const dropped = sorted[0];
  const total = sorted.slice(1).reduce((s,v)=>s+v,0);
  return { total, rolls, dropped };
}
function modifier(score){ return Math.floor((score-10)/2); }

function permutations(arr){
  if(arr.length<=1) return [arr.slice()];
  const res = [];
  for(let i=0;i<arr.length;i++){
    const rest = arr.slice(0,i).concat(arr.slice(i+1));
    for(const p of permutations(rest)) res.push([arr[i], ...p]);
  }
  return res;
}

export default function BackgroundOptimizer(){
  const [rolls, setRolls] = useState(["","","","","",""]);
  const [breakdowns, setBreakdowns] = useState([null,null,null,null,null,null]); // stores {total, rolls, dropped}
  const [useAuto, setUseAuto] = useState(true);
  const [background, setBackground] = useState(null);
  const [mode, setMode] = useState("+2/+1");
  const [choices, setChoices] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // theme state (persisted)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('dnd_theme') || 'light'; } catch { return 'light'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
    try { localStorage.setItem('dnd_theme', theme); } catch {}
  }, [theme]);

  // when auto mode enabled, generate breakdowns + totals
  useEffect(()=>{
    if(useAuto){
      const totals = [];
      const b = [];
      for(let i=0;i<6;i++){
        const d = roll4d6DropLowestDetailed();
        totals.push(d.total);
        b.push(d);
      }
      setRolls(totals);
      setBreakdowns(b);
    }
  }, [useAuto]);

  const updateRoll = (i,val)=>{
    const copy=[...rolls];
    copy[i]=val;
    setRolls(copy);
    // clear breakdown for manual edits
    const b=[...breakdowns];
    b[i]=null;
    setBreakdowns(b);
  };

  const allowed = background ? (BACKGROUNDS[background]?.abilities || STAT_KEYS) : STAT_KEYS;

  const toggleChoice = (s)=>{
    setChoices(prev=>{
      const next=[...prev];
      if(next.includes(s)) next.splice(next.indexOf(s),1);
      else {
        const limit = mode === "+2/+1" ? 2 : 3;
        if(next.length < limit && allowed.includes(s)) next.push(s);
      }
      return next;
    });
  };

  const applyBackgroundToAssign = (assignment)=>{
    const out = {...assignment};
    if(!background) return out;
    if(mode === "+2/+1"){
      const [a,b] = choices;
      if(a) out[a] = (out[a]||0) + 2;
      if(b) out[b] = (out[b]||0) + 1;
    } else {
      choices.slice(0,3).forEach(s=>{ if(s) out[s] = (out[s]||0) + 1; });
    }
    return out;
  };

  const compute = useMemo(()=>{
    const nums = rolls.map(Number);
    if(nums.some(n=>isNaN(n))) return { error: "Enter six numeric rolls or switch to Auto mode." };
    const perms = permutations(nums);
    const results = CLASS_DATA.map(cls=>{
      let best = { score: -Infinity, assign: null };
      for(const p of perms){
        const assign = {}; STAT_KEYS.forEach((s,i)=>assign[s]=p[i]);
        const withBg = applyBackgroundToAssign(assign);
        let sc = 0;
        for(const s of STAT_KEYS) sc += (withBg[s]||assign[s]||0) * (cls.weights[s]||0);
        if(sc > best.score){ best = { score: sc, assign: assign }; }
      }
      return { className: cls.name, score: best.score, assign: best.assign };
    });
    results.sort((a,b)=> a.className.localeCompare(b.className));
    return { results };
  }, [rolls, background, mode, choices]);

  const clearBackground = ()=>{ setBackground(null); setChoices([]); };

  const label = (k) => STAT_LABELS[k] || k;

  // helpers to reroll single index (used by Roll button)
  const rerollIndex = (i)=>{
    const d = roll4d6DropLowestDetailed();
    const r = [...rolls]; r[i]=d.total;
    const b = [...breakdowns]; b[i]=d;
    setRolls(r); setBreakdowns(b);
  };

  const rerollAll = ()=>{
    const totals=[]; const b=[];
    for(let i=0;i<6;i++){ const d=roll4d6DropLowestDetailed(); totals.push(d.total); b.push(d); }
    setRolls(totals); setBreakdowns(b);
  };

  return (
    // outer wrapper: no gradient here — page bg controlled by index.html
    <div className="min-h-screen flex items-start justify-center p-8 transition-colors">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 p-6 rounded shadow text-slate-800 dark:text-slate-200 transition-colors">

        {/* Header + theme toggle top-right inside container */}
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">D&amp;D 2024 — Classes Optimizer</h1>
              <p className="text-sm text-slate-600 mb-4 dark:text-slate-300">
                Use this tool to compare how your rolled stats and background bonuses fit every class for early-game play (levels 1–3).
                The background feature is optional and can be changed anytime to test different backgrounds, but no ability score improvements or custom bonuses are included.
              </p>
            </div>

            {/* Theme selector as two pill buttons (no emoji) */}
            <div className="ml-4 flex items-center gap-2">
              <button
                onClick={()=>setTheme('light')}
                className={`px-3 py-1 rounded-full border transition ${theme==='light' ? 'bg-slate-800 text-white font-bold border-slate-800' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}
              >Light</button>
              <button
                onClick={()=>setTheme('dark')}
                className={`px-3 py-1 rounded-full border transition ${theme==='dark' ? 'bg-slate-800 text-white font-bold border-slate-800' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}
              >Dark</button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {/* Rolls + Background column */}
          <div className="p-4 border rounded bg-white dark:bg-slate-800">
            {/* Styled radio-like pills inside Rolls container */}
            <div className="flex items-center gap-3 mb-3">
              <label
                role="radio"
                aria-checked={useAuto}
                onClick={()=>setUseAuto(true)}
                className={`px-3 py-1 rounded-full border cursor-pointer select-none transition ${useAuto ? 'bg-slate-800 text-white font-bold border-slate-800' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}
              >
                <input type="radio" name="inputMode" className="sr-only" checked={useAuto} onChange={()=>setUseAuto(true)} />
                Auto Rolls
              </label>

              <label
                role="radio"
                aria-checked={!useAuto}
                onClick={()=>setUseAuto(false)}
                className={`px-3 py-1 rounded-full border cursor-pointer select-none transition ${!useAuto ? 'bg-slate-800 text-white font-bold border-slate-800' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'}`}
              >
                <input type="radio" name="inputMode" className="sr-only" checked={!useAuto} onChange={()=>setUseAuto(false)} />
                Manual Input
              </label>
            </div>

            <h2 className="font-semibold">Rolls</h2>
            <div className="mt-2 flex gap-2 items-center">
              <button onClick={rerollAll} className="px-3 py-1 border rounded dark:border-slate-600">Auto Rolls</button>
              <button onClick={()=>{ setRolls(['','','','','','']); setBreakdowns([null,null,null,null,null,null]); }} className="px-3 py-1 border rounded dark:border-slate-600">Clear</button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {rolls.map((r,i)=>(
                <div key={i} className="flex items-center gap-2 relative"
                     onMouseEnter={()=>setHoverIndex(i)} onMouseLeave={()=>setHoverIndex(null)}>
                  <input
                    className="w-20 p-2 border rounded text-center bg-white dark:bg-slate-700 dark:border-slate-600"
                    value={r}
                    onChange={(e)=>updateRoll(i,e.target.value)}
                    disabled={useAuto}
                  />
                  <button className="px-2 py-1 border rounded text-xs dark:border-slate-600" onClick={()=>rerollIndex(i)}>Roll</button>

                  {/* styled floating tooltip for auto roll breakdown */}
                  {useAuto && breakdowns[i] && hoverIndex===i && (
                    <div className="absolute z-20 -top-14 left-0 w-max p-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border rounded shadow">
                      <div className="text-xs font-medium">Roll breakdown</div>
                      <div className="mt-1 text-sm">
                        {breakdowns[i].rolls.map((v,idx)=>(
                          <span key={idx} className={v===breakdowns[i].dropped ? 'line-through opacity-80 mr-1' : 'mr-1'}>
                            {v}
                          </span>
                        ))}
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dropped: {breakdowns[i].dropped}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="font-medium">Background</h3>
              <div className="mt-2">
                <select
                  value={background||''}
                  onChange={(e)=>{ setBackground(e.target.value||null); setChoices([]); }}
                  className="w-full border rounded p-2 bg-white dark:bg-slate-700 dark:border-slate-600"
                >
                  <option value="">— Choose Background —</option>
                  {Object.keys(BACKGROUNDS).map(k=> <option key={k} value={k}>{k}</option>)}
                </select>

                {/* Clear Background button below the dropdown */}
                <div className="mt-2">
                  <button onClick={clearBackground} className="px-3 py-1 border rounded dark:border-slate-600">Clear Background</button>
                </div>

                {background && <div className="mt-2">
                  <div className="text-sm text-slate-700 dark:text-slate-200">Mode:
                    <select value={mode} onChange={(e)=>{ setMode(e.target.value); setChoices([]); }} className="ml-2 border rounded p-1 bg-white dark:bg-slate-700 dark:border-slate-600">
                      <option value="+2/+1">+2 / +1</option>
                      <option value="+1/+1/+1">+1 / +1 / +1</option>
                    </select>
                  </div>
                  <div className="mt-2 text-sm">Allowed: {allowed.map(a=>label(a)).join(', ')}</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {allowed.map(s=> <button key={s} onClick={()=>toggleChoice(s)} className={'px-3 py-1 border rounded '+(choices.includes(s)?'bg-slate-700 text-white dark:bg-slate-600':'')}>{label(s)}</button>)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Selected: {choices.map(c=>label(c)).join(', ') || '—'}</div>
                </div>}
              </div>
            </div>
          </div>

          {/* Classes column */}
          <div className="p-4 border rounded bg-white dark:bg-slate-800">
            <h2 className="font-semibold">Classes</h2>
            <div className="mt-3 space-y-2 max-h-[480px] overflow-auto">
              {!compute.results && <div className="text-sm text-slate-500 dark:text-slate-400">Enter rolls or use Auto Rolls to compute.</div>}
              {compute.results && compute.results.map((r)=>(
                <div
                  key={r.className}
                  onClick={()=>setSelectedClass(r.className)}
                  className={'p-3 rounded border cursor-pointer flex justify-between items-center '+(selectedClass===r.className?'bg-slate-100 border-slate-400 dark:bg-slate-700 dark:border-slate-600':'bg-white dark:bg-slate-800')}
                >
                  <div><div className="font-medium">{r.className}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected class details */}
        <div className="mt-4 p-4 border rounded bg-white dark:bg-slate-800">
          <h2 className="font-semibold">Selected class details</h2>
          <div className="mt-3">
            {!selectedClass && <div className="text-sm text-slate-500 dark:text-slate-400">Click a class on the right to view its optimized assignment.</div>}
            {selectedClass && compute.results && (()=>{ 
              const r = compute.results.find(x=>x.className===selectedClass); 
              if(!r) return <div className="text-sm">No data</div>; 
              const applied = applyBackgroundToAssign(r.assign); 
              return (
                <div>
                  <div className="mb-2 font-semibold">{r.className}</div>
                  <div className="grid grid-cols-6 gap-2">
                    {STAT_KEYS.map(s=>(
                      <div key={s} className="p-2 border rounded text-center">
                        <div className="text-xs text-slate-500 dark:text-slate-400">{label(s)}</div>
                        <div className="text-xl font-semibold font-mono">{applied[s]}</div>
                        <div className="text-4xl">{modifier(applied[s]) > 0 ? '+'+modifier(applied[s]) : modifier(applied[s])}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ); 
            })()}
          </div>
        </div>

      </div>
    </div>
  );
}
