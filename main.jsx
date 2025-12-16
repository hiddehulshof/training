import React, { useState, useEffect } from 'react';
import { Calendar, Moon, Zap, Trophy, Dumbbell, Coffee, Info, ChevronLeft, ChevronRight } from 'lucide-react';

// --- DATA & LOGIC ---

// De vaste wedstrijden en uitzonderingen (Hardcoded)
const SPECIAL_DATES = {
  "2025-12-20": { type: "match", title: "Wedstrijd Thuis", details: "vs BVC'73 (15:30)", icon: "trophy" },
  
  // Kerstvakantie
  "2025-12-24": { type: "rest", title: "Kerstavond", details: "Geniet ervan!", icon: "coffee" },
  "2025-12-25": { type: "rest", title: "1e Kerstdag", details: "Eet veel (brandstof)", icon: "coffee" },
  "2025-12-26": { type: "rest", title: "2e Kerstdag", details: "Relaxen", icon: "coffee" },
  "2025-12-31": { type: "rest", title: "Oudjaarsdag", details: "Oliebollen!", icon: "coffee" },
  
  // Januari
  "2026-01-03": { type: "power", title: "Power Training", details: "Buiten sprints + Circuit", icon: "zap" },
  "2026-01-10": { type: "match", title: "Wedstrijd Uit", details: "vs BVC'73 (16:30)", icon: "trophy" },
  "2026-01-17": { type: "match", title: "Wedstrijd Thuis", details: "vs Bovo 2 (15:30)", icon: "trophy" },
  "2026-01-24": { type: "power", title: "Power Training", details: "Je bent fris! Sprints + Circuit", icon: "zap" },
  "2026-01-31": { type: "match", title: "Wedstrijd Uit", details: "vs Bovo 1 (18:00)", icon: "trophy" },
  
  // Februari
  "2026-02-07": { type: "match", title: "Wedstrijd Thuis", details: "vs Harambee (12:00)", icon: "trophy" },
  "2026-02-14": { type: "power", title: "Power Training", details: "Sprints + Circuit", icon: "zap" },
  "2026-02-21": { type: "power", title: "Power Training", details: "Sprints + Circuit", icon: "zap" },
  
  // De lastige week (Donderdag wedstrijd)
  "2026-02-26": { type: "match", title: "WEDSTRIJD UIT", details: "vs VIOS Eefde (21:15) - GEEN KRACHT VANDAAG", icon: "trophy" },
  "2026-02-27": { type: "rest", title: "Slaap Inhalen", details: "Herstel van late wedstrijd", icon: "moon" },
  "2026-02-28": { type: "strength", title: "Kracht Circuit", details: "Inhalen van donderdag", icon: "dumbbell" },
  
  // Maart
  "2026-03-07": { type: "power", title: "Power Training", details: "Sprints + Circuit", icon: "zap" },
  "2026-03-14": { type: "match", title: "Wedstrijd Thuis", details: "vs Gemini (15:30)", icon: "trophy" },
  
  // De tweede lastige week
  "2026-03-19": { type: "match", title: "WEDSTRIJD UIT", details: "vs Vips Bardot (19:00) - GEEN KRACHT VANDAAG", icon: "trophy" },
  "2026-03-20": { type: "rest", title: "Rust / Slaap", details: "Herstel pakken", icon: "moon" },
  "2026-03-21": { type: "rest", title: "Rust Weekend", details: "Licht bewegen mag", icon: "coffee" },
  
  "2026-03-28": { type: "match", title: "Wedstrijd Uit", details: "vs Tornax (16:00)", icon: "trophy" },
  
  // April
  "2026-04-04": { type: "power", title: "Power Training", details: "Paasweekend knallen", icon: "zap" },
  "2026-04-11": { type: "match", title: "Wedstrijd Thuis", details: "vs Elite/Dynamo (15:30) - LAATSTE!", icon: "trophy" },
};

const getDayPlan = (dateStr, dayIndex) => {
  // 1. Check overrides first
  if (SPECIAL_DATES[dateStr]) {
    return SPECIAL_DATES[dateStr];
  }

  // 2. Default Routine
  switch (dayIndex) {
    case 1: // Maandag
      return { type: "training", title: "Volleybal Training", details: "LET OP: Direct eiwitten & slapen (5u nacht)", icon: "volleyball" };
    case 2: // Dinsdag
      return { type: "sleep", title: "SLAAPAVOND", details: "Minimaal 9 uur pakken. Geen sport.", icon: "moon" };
    case 3: // Woensdag
      return { type: "training", title: "Volleybal Training", details: "LET OP: Direct eiwitten & slapen (5u nacht)", icon: "volleyball" };
    case 4: // Donderdag
      return { type: "strength", title: "Kracht Circuit", details: "Moe? Neem espresso. Kapot? Ga slapen.", icon: "dumbbell" };
    case 5: // Vrijdag
      return { type: "rest", title: "Rust & Herstel", details: "Slaap voorbufferen voor zaterdag", icon: "coffee" };
    case 6: // Zaterdag (Default als er geen wedstrijd is in de lijst)
      return { type: "rest", title: "Vrij Weekend", details: "Rust of lichte Power Training", icon: "zap" };
    case 0: // Zondag
      return { type: "rest", title: "Rustdag", details: "Wandelen of relaxen", icon: "coffee" };
    default:
      return { type: "rest", title: "Rust", details: "", icon: "coffee" };
  }
};

const getColorClass = (type) => {
  switch (type) {
    case "match": return "bg-red-100 border-red-500 text-red-900";
    case "training": return "bg-blue-100 border-blue-500 text-blue-900";
    case "sleep": return "bg-indigo-100 border-indigo-500 text-indigo-900";
    case "strength": return "bg-orange-100 border-orange-500 text-orange-900";
    case "power": return "bg-yellow-100 border-yellow-500 text-yellow-900";
    default: return "bg-gray-100 border-gray-400 text-gray-800";
  }
};

const getIcon = (iconName) => {
  switch (iconName) {
    case "trophy": return <Trophy className="w-6 h-6" />;
    case "volleyball": return <div className="text-xl">🏐</div>; // Lucide doesn't have volleyball yet
    case "moon": return <Moon className="w-6 h-6" />;
    case "dumbbell": return <Dumbbell className="w-6 h-6" />;
    case "zap": return <Zap className="w-6 h-6" />;
    case "coffee": return <Coffee className="w-6 h-6" />;
    default: return <Info className="w-6 h-6" />;
  }
};

// --- COMPONENTS ---

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✕</button>
        {children}
      </div>
    </div>
  );
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCircuit, setShowCircuit] = useState(false);

  // Helper to format YYYY-MM-DD
  const toISODate = (d) => d.toISOString().split('T')[0];

  // Helper to get day name in Dutch
  const getDayName = (d) => d.toLocaleDateString('nl-NL', { weekday: 'long' });
  const getNiceDate = (d) => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });

  // Navigation
  const nextDay = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 1);
    setCurrentDate(next);
  };

  const prevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 1);
    setCurrentDate(prev);
  };
  
  const resetToday = () => setCurrentDate(new Date());

  // Derive Plan for Displayed Date
  const dateStr = toISODate(currentDate);
  const plan = getDayPlan(dateStr, currentDate.getDay());
  const isToday = toISODate(new Date()) === dateStr;

  // Generate Week View
  const getWeekDays = (baseDate) => {
    const days = [];
    const currentDayIndex = baseDate.getDay() || 7; // Make Sunday 7
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - (currentDayIndex - 1));

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* HEADER */}
      <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Volleybal Schema</h1>
          <button 
            onClick={() => setShowCircuit(true)}
            className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded-full transition"
          >
            Mijn Circuit
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {/* DATE NAVIGATION */}
        <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
          <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
          <div className="text-center cursor-pointer" onClick={resetToday}>
            <div className="text-xs text-gray-500 uppercase font-bold">{isToday ? "VANDAAG" : getDayName(currentDate)}</div>
            <div className="font-semibold">{getNiceDate(currentDate)}</div>
          </div>
          <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* HERO CARD (TODAY'S ACTION) */}
        <div className={`p-6 rounded-2xl shadow-md border-l-8 flex flex-col items-center text-center space-y-3 transition-colors duration-300 ${getColorClass(plan.type)}`}>
          <div className="bg-white bg-opacity-30 p-3 rounded-full">
            {getIcon(plan.icon)}
          </div>
          <h2 className="text-2xl font-bold">{plan.title}</h2>
          <p className="font-medium opacity-90">{plan.details}</p>
          
          {plan.type === "strength" && (
            <button 
              onClick={() => setShowCircuit(true)}
              className="mt-4 text-sm underline opacity-75 hover:opacity-100"
            >
              Bekijk oefeningen
            </button>
          )}
        </div>

        {/* WEEK OVERVIEW */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Deze Week</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {weekDays.map((d) => {
              const dStr = toISODate(d);
              const p = getDayPlan(dStr, d.getDay());
              const isSelected = dStr === dateStr;
              const isRealToday = dStr === toISODate(new Date());

              return (
                <div 
                  key={dStr} 
                  onClick={() => setCurrentDate(d)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 text-center text-xs font-bold ${isRealToday ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div>{d.toLocaleDateString('nl-NL', { weekday: 'short' }).toUpperCase()}</div>
                      <div className="text-sm">{d.getDate()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{p.title}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[180px]">{p.details}</div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-full ${p.type === 'match' ? 'text-red-500' : 'text-gray-300'}`}>
                    {p.type === 'match' ? <Trophy className="w-4 h-4" /> : (p.type === 'sleep' ? <Moon className="w-4 h-4"/> : null)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RULES CARD */}
        <div className="bg-slate-800 text-slate-200 p-4 rounded-xl text-xs space-y-2">
          <h3 className="font-bold text-white mb-2 border-b border-slate-600 pb-1">GOUDEN REGELS</h3>
          <p>✅ <span className="text-yellow-400 font-bold">Ma/Wo:</span> Direct eiwitten & slapen na training.</p>
          <p>✅ <span className="text-blue-300 font-bold">Dinsdag:</span> 9+ uur slapen is verplicht.</p>
          <p>✅ <span className="text-orange-300 font-bold">Donderdag:</span> Moe? Neem koffie. Kapot? Ga slapen.</p>
        </div>
      </div>

      {/* CIRCUIT MODAL */}
      <Modal isOpen={showCircuit} onClose={() => setShowCircuit(false)}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-blue-600" /> Jouw Kracht Circuit
        </h2>
        <p className="text-sm text-gray-500 mb-4">Doe 3 rondes. 90 sec rust tussen rondes.</p>
        
        <ul className="space-y-4 text-sm">
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">1</div>
            <div>
              <span className="font-bold block">Banded Squats</span>
              <span className="text-gray-600">15x. Op band staan, uiteinden bij schouders.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">2</div>
            <div>
              <span className="font-bold block">Jump Squats</span>
              <span className="text-gray-600">8-10x. Explosief omhoog, zacht landen!</span>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">3</div>
            <div>
              <span className="font-bold block">Band Pull-Aparts</span>
              <span className="text-gray-600">15-20x. Armen gestrekt, band naar borst trekken.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">4</div>
            <div>
              <span className="font-bold block">Monster Walks</span>
              <span className="text-gray-600">20 stap links/rechts. Band om enkels/knieën.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">5</div>
            <div>
              <span className="font-bold block">Overhead Press</span>
              <span className="text-gray-600">10-12x. Op band staan, uitduwen boven hoofd.</span>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">6</div>
            <div>
              <span className="font-bold block">Plank</span>
              <span className="text-gray-600">45-60 sec. Navel intrekken.</span>
            </div>
          </li>
        </ul>
        <button 
          onClick={() => setShowCircuit(false)}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          Sluiten
        </button>
      </Modal>
    </div>
  );
}
