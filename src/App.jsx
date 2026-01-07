import "./index.css";

import { useState, useEffect } from "react";
import { Settings, RefreshCw } from "lucide-react";

// Default/Initial compositions
const DEFAULT_INPUT = `569
7 11 2
208`;

// --- CONSTANTS ---
const FILL_OPTIONS = [150000, 200000, 300000];

const CONFIG_PRESETS = {
  "80/20": { id: "80/20", t5Percent: 0.8, t4Percent: 0.2, label: "80/20" },
  "90/10": { id: "90/10", t5Percent: 0.9, t4Percent: 0.1, label: "90/10" },
  "100/0": { id: "100/0", t5Percent: 1, t4Percent: 0, label: "100/0" },
};

// --- HELPER FUNCTIONS ---
const formatNumber = (num) => {
  if (num === 0) return "0";
  return `${(num / 1000).toFixed(2)}k`;
};

// Converts raw strings like "9 6 5" or "208" into comp objects
const parseComps = (inputText) => {
  return inputText
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map((line, index) => {
      const cleanLine = line.trim();
      let phalanxNumbers = [];

      const spaceSplit = cleanLine
        .split(/[/\s.-]+/)
        .filter((n) => !isNaN(parseFloat(n)));

      if (spaceSplit.length === 3) {
        phalanxNumbers = spaceSplit.map(Number);
      } else if (cleanLine.length === 3 && !isNaN(cleanLine)) {
        phalanxNumbers = cleanLine.split("").map(Number);
      } else {
        return null;
      }

      const [inf, rng, cav] = phalanxNumbers;
      const totalParts = inf + rng + cav;

      if (totalParts === 0) return null;

      return {
        id: `custom-${index}`,
        name: cleanLine.toUpperCase(),
        ratios: {
          inf: inf / totalParts,
          rng: rng / totalParts,
          cav: cav / totalParts,
        },
      };
    })
    .filter((comp) => comp !== null);
};

// --- COMPONENTS ---

const CompBlock = ({ comp, config, totalFill }) => {
  const t5Total = totalFill * config.t5Percent;
  const t4Total = totalFill * config.t4Percent;

  const t5 = {
    inf: t5Total * comp.ratios.inf,
    rng: t5Total * comp.ratios.rng,
    cav: t5Total * comp.ratios.cav,
  };

  const t4 = {
    inf: t4Total * comp.ratios.inf,
    rng: t4Total * comp.ratios.rng,
    cav: t4Total * comp.ratios.cav,
  };

  return (
    <div className="comp-card">
      <div className="comp-header flex justify-between items-center">
        <h3 className="comp-title">{comp.name}</h3>
      </div>

      <div className="comp-body">
        {/* Header da Grid */}
        <div className="grid mb-2">
          <div></div> {/* Spacer */}
          <div className="grid-header col-inf">Inf</div>
          <div className="grid-header col-rng">Rng</div>
          <div className="grid-header col-cav">Cav</div>
        </div>

        {/* T5 Row */}
        <div className="grid grid-row border-bottom py-1.5">
          <div className="troops-font font-bold">T5</div>
          <div className="troops-font col-inf text-right">
            {formatNumber(t5.inf)}
          </div>
          <div className="troops-font col-rng text-right">
            {formatNumber(t5.rng)}
          </div>
          <div className="troops-font col-cav text-right">
            {formatNumber(t5.cav)}
          </div>
        </div>

        {/* T4 Row */}
        <div className="grid py-1.5">
          <div className="troops-font font-bold">T4</div>
          <div className="troops-font col-inf text-right">
            {formatNumber(t4.inf)}
          </div>
          <div className="troops-font col-rng text-right">
            {formatNumber(t4.rng)}
          </div>
          <div className="troops-font col-cav text-right">
            {formatNumber(t4.cav)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activePreset, setActivePreset] = useState("90/10");
  const [fillTotal, setFillTotal] = useState(200000);
  const [inputText, setInputText] = useState(DEFAULT_INPUT);
  const [comps, setComps] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const parsed = parseComps(inputText);
    setComps(parsed);
  }, [inputText]);

  const currentConfig = CONFIG_PRESETS[activePreset];

  return (
    <div className="app-container">
      <div className="main-panel">
        {/* Header Area */}
        <div className="panel-header">
          <div className="header-content">
            <h2 className="page-title">Troops</h2>

            <div className="controls-group">
              {/* Fill Toggle */}
              <div className="toggle-container">
                {FILL_OPTIONS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setFillTotal(amount)}
                    className={`btn-toggle ${
                      fillTotal === amount ? "active" : ""
                    }`}
                  >
                    {formatNumber(amount)}
                  </button>
                ))}
              </div>

              {/* Preset Toggle */}
              <div className="toggle-container">
                {Object.values(CONFIG_PRESETS).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setActivePreset(preset.id)}
                    className={`btn-toggle ${
                      activePreset === preset.id ? "active" : ""
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Settings Icon */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="btn-icon transition-colors hover:text-white"
                title="Edit Comps"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Settings Drawer */}
          {showSettings && (
            <div className="editor-container animate-in fade-in slide-in-from-top-2">
              <label className="troops-font font-bold text-slate-400 block mb-2">
                Edit Comps (Format: "Inf Rng Cav" or "965")
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="editor-textarea mb-2 block"
                placeholder="Example:&#10;9 6 5&#10;208&#10;4 4 2"
              />
              <button
                onClick={() => setInputText(DEFAULT_INPUT)}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} /> Reset Defaults
              </button>
            </div>
          )}
        </div>

        {/* List Area */}
        <div className="comps-list">
          {comps.length === 0 ? (
            <div className="text-center py-8 text-slate-400 italic">
              No valid compositions found. Check your input format.
            </div>
          ) : (
            comps.map((comp) => (
              <CompBlock
                key={comp.id}
                comp={comp}
                config={currentConfig}
                totalFill={fillTotal}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
