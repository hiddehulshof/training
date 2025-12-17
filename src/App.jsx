import React, { useState, useEffect } from 'react';
import { seedDatabase, getAll, getSetting, putSetting } from './db';
import {
  Calendar, Moon, Zap, Trophy, Dumbbell, Coffee, Info,
  ChevronLeft, ChevronRight, Utensils, CheckCircle, Droplets,
  ArrowRight, Settings,
  Apple, Carrot, Beef, ShoppingBasket, Dices, Plus, Trash2,
  Home, List, Activity, X, ChefHat
} from 'lucide-react';
import DataManagement from './components/DataManagement';
import CalorieTracker from './components/CalorieTracker';
import Insights from './components/Insights';
import TrainingLogModal from './components/TrainingLogModal';
import { getUserStats } from './gamification';

// --- DATA & LOGIC ---

// --- DATA & LOGIC ---
// Exported for usage in App but also seeding in db.js
export const RECIPES = [
  {
    id: 1,
    title: "Snelle Pasta Pesto met Kip",
    tags: ["Snel", "Eiwitrijk"],
    time: "15 min",
    ingredients: ["Volkoren Penne", "Kipfilet blokjes", "Groene Pesto", "Cherrytomaatjes", "Broccoli (diepvries)"],
    instructions: "Kook pasta en broccoli. Bak kip goudbruin. Meng alles met pesto en gehalveerde tomaatjes."
  },
  {
    id: 2,
    title: "Boerenomelet op Brood",
    tags: ["Lunch/Diner", "Vega"],
    time: "10 min",
    ingredients: ["4 Eieren", "Roerbakgroenten", "Volkoren Brood", "Geraspte 30+ kaas", "Scheutje melk"],
    instructions: "Bak groenten kort aan. Kluts eieren met melk en giet erover. Bak tot gestold. Serveer op brood."
  },
  {
    id: 3,
    title: "Kip Wraps met Mais & Bonen",
    tags: ["Peuterproof", "Eiwitrijk"],
    time: "20 min",
    ingredients: ["Volkoren Wraps", "Kipfilet of Vega stukjes", "Mais (blik)", "Kidneybonen", "Paprika", "Tomatenpuree"],
    instructions: "Bak kip en paprika. Voeg mais, bonen en puree toe. Vul wraps en rol op. Even kort in de pan voor een krokant korstje."
  },
  {
    id: 4,
    title: "Zoete Aardappel Stamppot",
    tags: ["Peuter Hit", "Vega"],
    time: "25 min",
    ingredients: ["Zoete Aardappels", "Spinazie (vers)", "Feta blokjes", "Pijnboompitten", "Vegetarische balletjes"],
    instructions: "Kook aardappels gaar en stamp fijn. Roer rauwe spinazie en feta erdoor (slinkt door hitte). Serveer met balletjes."
  },
  {
    id: 5,
    title: "Traybake met Worstjes & Groente",
    tags: ["Oven (Makkie)", "Weinig Afwas"],
    time: "30 min",
    ingredients: ["Krieltjes", "Kipworstjes", "Courgette", "Paprika", "Rode ui", "Italiaanse kruiden"],
    instructions: "Snijd alles grof. Meng met olie en kruiden op bakplaat. 25 min in oven op 200gr."
  },
  {
    id: 6,
    title: "Vissticks met Doperwten-Puree",
    tags: ["Peuterproof", "Vis"],
    time: "20 min",
    ingredients: ["Vissticks (oven)", "Aardappels", "Doperwten (diepvries)", "Viskruiden", "Kwark (ipv mayo)"],
    instructions: "Bak vissticks in oven. Kook aardappels en doperwten. Stamp tot een groene puree. Super leuk voor kids!"
  },
  {
    id: 7,
    title: "Macaroni met 'Verstopte' Groenten",
    tags: ["Peuterproof", "Prep"],
    time: "20 min",
    ingredients: ["Volkoren Macaroni", "Rundergehakt", "Courgette (geraspt)", "Wortel (geraspt)", "Passata (tomatensaus)"],
    instructions: "Rul gehakt. Bak geraspte groenten mee (zijn onzichtbaar!). Voeg saus toe. Meng met gekookte macaroni."
  },
  {
    id: 8,
    title: "Oosterse Wok met Rijst",
    tags: ["Snel", "Veel Groente"],
    time: "15 min",
    ingredients: ["Zilvervliesrijst", "Wokgroenten pakket", "Kip of Tofu", "Ketjap Manis (minder zout)", "Cashewnoten"],
    instructions: "Kook rijst. Wok kip en groenten op hoog vuur. Blus af met scheutje ketjap. Bestrooi met noten."
  },
  {
    id: 9,
    title: "Gezonde Pannenkoeken Party",
    tags: ["Papadag", "Lunch/Diner"],
    time: "20 min",
    ingredients: ["Volkorenmeel", "Eieren", "Halfvolle Melk", "Appel", "Kaneel", "Spekjes (optioneel)"],
    instructions: "Maak beslag. Bak pannenkoeken met schijfjes appel en kaneel erin meegebakken."
  },
  {
    id: 10,
    title: "Broccoli-Courgette Soep",
    tags: ["Vitamines", "Lunch/Diner"],
    time: "20 min",
    ingredients: ["Broccoli", "Courgette", "Bouillonblokje", "Kookroom (light)", "Stokbrood"],
    instructions: "Kook groenten in bouillon gaar. Pureer met staafmixer. Voeg scheutje room toe. Lekker dippen met brood."
  },
  {
    id: 11,
    title: "Chili con Carne (Mild)",
    tags: ["Prep", "Eiwitrijk"],
    time: "25 min",
    ingredients: ["Rundergehakt", "Bruine bonen", "Mais", "Paprika", "Tomatenblokjes", "Rijst"],
    instructions: "Rul gehakt. Voeg groenten en bonen toe. Laat sudderen in tomatenblokjes. Serveer met rijst."
  },
  {
    id: 12,
    title: "Poké Bowl met Zalm (uit blik)",
    tags: ["Koud", "Snel"],
    time: "10 min",
    ingredients: ["Rijst (afgekoeld)", "Zalm uit blik", "Komkommer", "Avocado", "Edamame boontjes", "Sojasaus"],
    instructions: "Doe rijst in kom. Leg toppings er los bovenop. Sprenkel beetje sojasaus erover."
  }
];

export const SPECIAL_DATES = {
  "2025-12-20": { type: "match", title: "Wedstrijd Thuis", details: "vs BVC'73 (15:30)", icon: "trophy" },
  "2025-12-24": { type: "rest", title: "Kerstavond", details: "Geniet ervan!", icon: "coffee" },
  "2025-12-25": { type: "rest", title: "1e Kerstdag", details: "Eet veel (brandstof)", icon: "coffee" },
  "2025-12-26": { type: "rest", title: "2e Kerstdag", details: "Relaxen", icon: "coffee" },
  "2025-12-31": { type: "rest", title: "Oudjaarsdag", details: "Oliebollen!", icon: "coffee" },
  "2026-01-03": { type: "power", title: "Power Training", details: "Buiten sprints + Circuit", icon: "zap" },
  "2026-01-10": { type: "match", title: "Wedstrijd Uit", details: "vs BVC'73 (16:30)", icon: "trophy" },
  "2026-01-17": { type: "match", title: "Wedstrijd Thuis", details: "vs Bovo 2 (15:30)", icon: "trophy" },
  "2026-01-24": { type: "power", title: "Power Training", details: "Je bent fris! Sprints + Circuit", icon: "zap" },
  "2026-01-31": { type: "match", title: "Wedstrijd Uit", details: "vs Bovo 1 (18:00)", icon: "trophy" },
  "2026-02-07": { type: "match", title: "Wedstrijd Thuis", details: "vs Harambee (12:00)", icon: "trophy" },
  "2026-02-14": { type: "power", title: "Power Training", details: "Sprints + Circuit", icon: "zap" },
  "2026-02-21": { type: "power", title: "Power Training", details: "Sprints + Circuit", icon: "zap" },
  "2026-02-26": { type: "match", title: "WEDSTRIJD UIT", details: "vs VIOS Eefde (21:15) - GEEN KRACHT", icon: "trophy" },
  "2026-02-27": { type: "rest", title: "Slaap Inhalen", details: "Herstel van late wedstrijd", icon: "moon" },
  "2026-02-28": { type: "strength", title: "Kracht Circuit", details: "Inhalen van donderdag", icon: "dumbbell" },
  "2026-03-07": { type: "power", title: "Power Training", details: "Sprints + Circuit", icon: "zap" },
  "2026-03-14": { type: "match", title: "Wedstrijd Thuis", details: "vs Gemini (15:30)", icon: "trophy" },
  "2026-03-19": { type: "match", title: "WEDSTRIJD UIT", details: "vs Vips Bardot (19:00) - GEEN KRACHT", icon: "trophy" },
  "2026-03-20": { type: "rest", title: "Rust / Slaap", details: "Herstel pakken", icon: "moon" },
  "2026-03-21": { type: "rest", title: "Rust Weekend", details: "Licht bewegen mag", icon: "coffee" },
  "2026-03-28": { type: "match", title: "Wedstrijd Uit", details: "vs Tornax (16:00)", icon: "trophy" },
  "2026-04-04": { type: "power", title: "Power Training", details: "Paasweekend knallen", icon: "zap" },
  "2026-04-11": { type: "match", title: "Wedstrijd Thuis", details: "vs Elite/Dynamo (15:30) - LAATSTE!", icon: "trophy" },
};

export const CIRCUIT_EXERCISES = [
  { id: 1, title: "Banded Squats", reps: "15x", desc: "Op band staan, uiteinden bij schouders." },
  { id: 2, title: "Jump Squats", reps: "8-10x", desc: "Explosief omhoog, zacht landen!" },
  { id: 3, title: "Band Pull-Aparts", reps: "15-20x", desc: "Armen gestrekt, band naar borst trekken." },
  { id: 4, title: "Monster Walks", reps: "20 stap", desc: "Links/rechts. Band om enkels/knieën." },
  { id: 5, title: "Overhead Press", reps: "10-12x", desc: "Op band staan, uitduwen boven hoofd." },
  { id: 6, title: "Plank", reps: "45-60s", desc: "Navel intrekken. Rug recht." },
];

const getRoutinePlan = (dayIndex) => {
  switch (dayIndex) {
    case 1: return { type: "training", title: "Volleybal Training", details: "LET OP: Direct eiwitten & slapen", icon: "volleyball" };
    case 2: return { type: "sleep", title: "SLAAPAVOND", details: "Minimaal 9 uur pakken. Geen sport.", icon: "moon" };
    case 3: return { type: "training", title: "Volleybal Training", details: "LET OP: Direct eiwitten & slapen", icon: "volleyball" };
    case 4: return { type: "strength", title: "Kracht Circuit", details: "Moe? Espresso. Kapot? Slapen.", icon: "dumbbell" };
    case 5: return { type: "rest", title: "Papadag & Herstel", details: "Focus op gezin & rustig aan", icon: "coffee" };
    case 6: return { type: "rest", title: "Vrij Weekend", details: "Rust of lichte Power Training", icon: "zap" };
    case 0: return { type: "rest", title: "Rustdag & Prep", details: "Voorbereiden op werkweek", icon: "coffee" };
    default: return { type: "rest", title: "Rust", details: "", icon: "coffee" };
  }
};

const getDetailedNutrition = (dayIndex, activityType) => {
  const base = {
    breakfast: "Havermout of kwark met fruit (start goed!)",
    lunch: "Volkoren boterhammen met kip/humus + Groente",
    dinner: "Gezonde pot: Groente, Vlees/Vega, Aardappel/Rijst",
    familyTip: "Zet een bakje komkommer/tomaat op tafel voor de kleintjes."
  };

  switch (dayIndex) {
    case 1: // Maandag (Training)
      return {
        ...base,
        lunch: "⚠️ Belangrijk: Eet een stevige lunch (pasta/rijst restje?) voor energie vanavond.",
        dinner: "Licht verteerbaar (vóór 18:00). Geen vette hap!",
        snack: "DIRECT na training: Kwark of Eiwitshake (voor herstel in korte nacht).",
        familyTip: "Kook zondag alvast voor vandaag, zodat je geen stress hebt na werk."
      };
    case 2: // Dinsdag (Slaap focus)
      return {
        ...base,
        breakfast: "Eieren of Volvette kwark (eiwitten & vetten voor verzadiging).",
        lunch: "Salade of Soep met brood. Voorkom de 'after-dinner dip' op werk.",
        dinner: "Veel groenten! Vitamines helpen je immuunsysteem.",
        familyTip: "Eet aan tafel zonder TV. De 2-jarige kopieert jouw eetgedrag."
      };
    case 3: // Woensdag (Training)
      return {
        ...base,
        lunch: "Koolhydraten stapelen: Brood of wraps. Je moet vanavond weer!",
        snack: "Om 16:00 een banaan op het werk. Zorg voor brandstof.",
        dinner: "Iets makkelijks maar gezonds (wokgerecht?).",
        familyTip: "Betrek de oudste (2jr) bij het wassen van de groente."
      };
    case 4: // Donderdag (Kracht)
      if (activityType === 'match') {
        return {
          ...base,
          lunch: "Grote warme lunch als het kan.",
          dinner: "Lichte maaltijd om 17:30. Pasta/Wraps.",
          snack: "Banaan en koek mee voor na de wedstrijd.",
          familyTip: "Zorg dat oppas/partner weet wat de kids eten."
        };
      }
      return {
        ...base,
        lunch: "Restjes van gisteren of een maaltijdsalade.",
        snack: "Koffie/Espresso om 17:00 voor je krachtcircuit.",
        dinner: "Eiwitrijk! Kip, Vis of Bonen. Je spieren schreeuwen om bouwstoffen.",
        familyTip: "Zorg dat het eten klaar is voordat je moe wordt van de werkweek."
      };
    case 5: // Vrijdag (Papadag)
      return {
        breakfast: "Samen ontbijten! Maak er een feestje van (bijv. roerei).",
        lunch: "Monkey Platter: Bordje met stukjes fruit, kaas, worst, brood. Eet samen hetzelfde.",
        dinner: "Zelfgemaakte pizza (wraps als bodem) of Traybake uit de oven.",
        familyTip: "Jij bent het voorbeeld. Als jij fruit eet, wil de kleine het ook."
      };
    case 6: // Zaterdag (Wedstrijd)
      if (activityType === 'match') {
        return {
          breakfast: "Pannenkoeken (gezond) of Havermout. Goede bodem.",
          lunch: "3 uur voor de wedstrijd: Laatste grote maaltijd (Pasta/Brood).",
          snack: "Neem een banaan en ontbijtkoek mee in je tas.",
          dinner: "Herstelmaaltijd na de wedstrijd: Pasta/Wraps met eiwitten.",
          familyTip: "Zorg dat de tas met snacks voor de kids ook klaar staat."
        };
      }
      return { ...base, dinner: "BBQ of lekker koken in het weekend." };
    case 0: // Zondag (Prep)
      return {
        breakfast: "Lekker uitslapen en rustig ontbijten.",
        lunch: "Soep met broodjes.",
        dinner: "MEALPREP ZONDAG: Kook een grote pan pasta/curry voor Ma & Wo.",
        familyTip: "Zet bakjes klaar voor je werkdagen. Geen kantine-voedsel deze week!"
      };
    default: return base;
  }
};

const getDayPlan = (dateStr, dayIndex, events) => {
  let basePlan = (events && events[dateStr]) ? events[dateStr] : getRoutinePlan(dayIndex);
  const nutrition = getDetailedNutrition(dayIndex, basePlan.type);
  return { ...basePlan, nutrition };
};

const getTheme = (type) => {
  switch (type) {
    case "match": return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50", border: "border-red-200" };
    case "training": return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" };
    case "sleep": return { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50", border: "border-indigo-200" };
    case "strength": return { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50", border: "border-orange-200" };
    case "power": return { bg: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-50", border: "border-yellow-200" };
    default: return { bg: "bg-slate-500", text: "text-slate-600", light: "bg-slate-50", border: "border-slate-200" };
  }
};

const getIcon = (iconName, className = "w-6 h-6") => {
  switch (iconName) {
    case "trophy": return <Trophy className={className} />;
    case "volleyball": return <div className="text-2xl">🏐</div>;
    case "moon": return <Moon className={className} />;
    case "dumbbell": return <Dumbbell className={className} />;
    case "zap": return <Zap className={className} />;
    case "coffee": return <Coffee className={className} />;
    default: return <Info className={className} />;
  }
};

// --- COMPONENTS ---

const WeekStrip = ({ currentDate, onSelectDate }) => {
  const days = [];
  const today = new Date();
  // Generate a 2-week window centered on today, or just this week. 
  // Let's do: Today - 2 days to Today + 4 days (7 days total)
  for (let i = -2; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-1 -mx-1 mb-6 snap-x">
      {days.map(d => {
        const isSelected = d.toDateString() === currentDate.toDateString();
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <button
            key={d.toISOString()}
            onClick={() => onSelectDate(d)}
            className={`flex flex-col items-center min-w-[3.5rem] p-2 rounded-2xl transition-all snap-center ${isSelected
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
              : 'bg-white text-slate-400 border border-slate-100'
              }`}
          >
            <span className="text-[10px] font-bold uppercase mb-1">{d.toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}</span>
            <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>{d.getDate()}</span>
            {isToday && <div className={`w-1 h-1 rounded-full mt-1 ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
          </button>
        )
      })}
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'food', icon: ChefHat, label: 'Voeding' },
    { id: 'circuit', icon: Activity, label: 'Circuit' },
    { id: 'list', icon: List, label: 'Lijst' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity pointer-events-auto" onClick={onClose} />
      <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl shadow-2xl transform transition-transform duration-300 pointer-events-auto max-h-[90vh] flex flex-col relative z-10">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const HabitButton = ({ icon: Icon, label, colorClass, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border ${active
      ? `bg-${colorClass}-100 border-${colorClass}-300 text-${colorClass}-700 shadow-sm scale-105`
      : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
      }`}
  >
    <div className={`p-2 rounded-full mb-2 ${active ? `bg-${colorClass}-200` : 'bg-slate-100'}`}>
      <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
  </button>
);

const RecipeCard = ({ recipe, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition cursor-pointer flex gap-4 items-center">
    <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center text-2xl shrink-0">
      🥘
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-slate-800 leading-tight mb-1">{recipe.title}</h4>
      <div className="flex gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {recipe.time}</span>
        <span className="px-2 py-0.5 bg-slate-100 rounded-full">{recipe.tags[0]}</span>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300" />
  </div>
);

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Feature Modals
  const [showInsights, setShowInsights] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);

  // Modals
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Data State
  const [recipes, setRecipes] = useState([]);
  const [events, setEvents] = useState({});
  const [exercises, setExercises] = useState([]);
  const [habits, setHabits] = useState({ water: false, fruit: false, veggies: false, protein: false });
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [userStats, setUserStats] = useState({ level: 1, progress: 0, streak: 0 });

  // Load Data from DB
  const loadData = async () => {
    await seedDatabase();

    // Load Recipes
    const allRecipes = await getAll('recipes');
    if (allRecipes.length > 0) setRecipes(allRecipes);
    else setRecipes(RECIPES); // Fallback to hardcoded if simple array from import

    // Load Events
    const allEvents = await getAll('events');
    if (allEvents.length > 0) {
      // Convert array back to object for keyed access
      const eventsObj = allEvents.reduce((acc, curr) => ({ ...acc, [curr.date]: curr }), {});
      setEvents(eventsObj);
    } else {
      setEvents(SPECIAL_DATES);
    }

    // Load Exercises
    const allExercises = await getAll('exercises');
    if (allExercises.length > 0) setExercises(allExercises);
    else setExercises(CIRCUIT_EXERCISES);

    // Load Settings
    const savedHabits = await getSetting('habits');
    if (savedHabits) setHabits(savedHabits);

    const savedList = await getSetting('shoppingList');
    if (savedList) setShoppingListItems(savedList);

    const stats = await getUserStats();
    setUserStats(stats);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helpers
  const toISODate = (d) => d.toISOString().split('T')[0];
  const dateStr = toISODate(currentDate);
  const plan = getDayPlan(dateStr, currentDate.getDay(), events);
  const theme = getTheme(plan.type);
  const isToday = toISODate(new Date()) === dateStr;

  const toggleHabit = (key) => {
    setHabits(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      putSetting('habits', newState); // Persist
      return newState;
    });
  };

  const spinRecipe = () => {
    const list = recipes.length > 0 ? recipes : RECIPES;
    const random = list[Math.floor(Math.random() * list.length)];
    setSelectedRecipe(random);
    setShowRecipeModal(true);
  };

  const addIngredientsToList = () => {
    if (selectedRecipe) {
      const newItems = selectedRecipe.ingredients.filter(item => !shoppingListItems.includes(item));
      setShoppingListItems(prev => {
        const updatedList = [...prev, ...newItems];
        putSetting('shoppingList', updatedList); // Persist
        return updatedList;
      });
      setShowRecipeModal(false);
      setActiveTab('list'); // Switch to list tab
    }
  };

  const clearList = () => {
    setShoppingListItems([]);
    putSetting('shoppingList', []);
  };

  // Views
  const renderHome = () => (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex justify-between items-end px-1">
        <div>
          <label className="relative cursor-pointer group flex items-center gap-2">
            <input
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer"
              value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => setCurrentDate(new Date(e.target.value))}
            />
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition flex items-center gap-1">
              {currentDate.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
              <ChevronRight className="w-4 h-4 rotate-90" />
            </p>
          </label>
          <h1 className="text-3xl font-bold text-slate-900">Hoi, Hidde 👋</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 flex items-center gap-2 shadow-sm">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="10" cy="10" r="8" stroke="#e2e8f0" strokeWidth="3" fill="none" />
                  <circle cx="10" cy="10" r="8" stroke="#3b82f6" strokeWidth="3" fill="none" strokeDasharray="50" strokeDashoffset={50 - (50 * userStats.progress) / 100} />
                </svg>
                <span className="absolute text-[8px] font-bold text-blue-600">{userStats.level}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Level</span>
                <span className="text-xs font-bold text-slate-800 leading-none">{userStats.level}</span>
              </div>
            </div>
            <button onClick={() => setShowAdminModal(true)} className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 transition">
              <Settings className="w-6 h-6" />
            </button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className={`p-2 rounded-full transition ${isToday ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            <Calendar className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Week Strip */}
      <WeekStrip currentDate={currentDate} onSelectDate={setCurrentDate} />

      {/* Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 shadow-lg text-white ${theme.bg}`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
          {getIcon(plan.icon, "w-40 h-40")}
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-4 border border-white/10">
            {getIcon(plan.icon, "w-3 h-3")}
            <span className="uppercase">{plan.type === 'match' ? 'Wedstrijdag' : plan.type}</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 leading-tight">{plan.title}</h2>
          <p className="text-white/90 font-medium text-lg mb-6 max-w-[80%]">{plan.details}</p>

          {plan.type === 'strength' && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('circuit')}
                className="bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-50 transition flex items-center gap-2"
              >
                Start Circuit <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}
          <button
            onClick={() => setShowTrainingModal(true)}
            className="bg-orange-700/50 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700/70 transition flex items-center gap-2"
          >
            Log Resultaat <Trophy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Habit Tracker */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3 px-1">Dagelijkse Doelen</h3>
        <div className="grid grid-cols-2 gap-3">
          <HabitButton icon={Droplets} label="2L Water" colorClass="blue" active={habits.water} onClick={() => toggleHabit('water')} />
          <HabitButton icon={Apple} label="2x Fruit" colorClass="green" active={habits.fruit} onClick={() => toggleHabit('fruit')} />
          <HabitButton icon={Carrot} label="Groente" colorClass="green" active={habits.veggies} onClick={() => toggleHabit('veggies')} />
          <HabitButton icon={Beef} label="Eiwit" colorClass="red" active={habits.protein} onClick={() => toggleHabit('protein')} />
        </div>
      </div>

      {/* Quick Nutrition */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Vandaag Eten</h3>
          <button onClick={() => setActiveTab('food')} className="text-sm font-bold text-blue-600 hover:underline">Details</button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Diner</p>
              <p className="text-slate-700 font-medium leading-snug">{plan.nutrition.dinner}</p>
            </div>
          </div>
          {plan.nutrition.snack && (
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Snack Tip</p>
                <p className="text-slate-700 font-medium leading-snug">{plan.nutrition.snack}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFood = () => (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="px-1">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Voeding & Recepten</h1>
        <p className="text-slate-500">Brandstof voor je prestaties.</p>
      </div>

      <CalorieTracker
        onShowInsights={() => setShowInsights(true)}
        date={currentDate}
      />

      {/* Daily Plan Card */}
      <div className="bg-green-50 rounded-3xl p-6 border border-green-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <ChefHat className="w-32 h-32 text-green-900" />
        </div>
        <h3 className="text-green-900 font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
          <Utensils className="w-5 h-5" /> Menu van Vandaag
        </h3>
        <div className="space-y-4 relative z-10">
          {['breakfast', 'lunch', 'dinner'].map(type => (
            <div key={type} className="bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50">
              <span className="text-[10px] font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded uppercase mb-1 inline-block">
                {type === 'breakfast' ? 'Ontbijt' : type}
              </span>
              <p className="text-sm text-green-900 font-medium">{plan.nutrition[type]}</p>
            </div>
          ))}
          <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex gap-3 items-start">
            <Info className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 italic"><strong>Family Tip:</strong> {plan.nutrition.familyTip}</p>
          </div>
        </div>
      </div>

      {/* Recipe Roulette */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-lg font-bold text-slate-800">Inspiratie Nodig?</h3>
        </div>
        <button
          onClick={spinRecipe}
          className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Dices className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="block font-bold text-lg">Wat eten we?</span>
              <span className="text-white/80 text-xs">Krijg een random recept</span>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition" />
        </button>
      </div>

      {/* Popular Recipes List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-800 px-1">Favorieten</h3>
        {recipes.slice(0, 3).map(r => (
          <RecipeCard key={r.id} recipe={r} onClick={() => { setSelectedRecipe(r); setShowRecipeModal(true); }} />
        ))}
      </div>
    </div>
  );

  const renderCircuit = () => (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="px-1">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Kracht Circuit</h1>
        <p className="text-slate-500">3 rondes. 90 sec rust tussen rondes.</p>
      </div>

      <div className="space-y-3">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-xl flex items-center justify-center shrink-0">
              {ex.id}
            </div>
            <div>
              <h4 className="font-bold text-slate-800">{ex.title}</h4>
              <p className="text-xs text-slate-500">{ex.desc}</p>
            </div>
            <div className="ml-auto bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
              {ex.reps}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3">
        <Info className="w-5 h-5 text-orange-500 shrink-0" />
        <p className="text-sm text-orange-800">
          <strong>Tip:</strong> Focus op vorm, niet op snelheid. Als het te makkelijk is, pak de band korter vast.
        </p>
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="px-1 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Boodschappen</h1>
          <p className="text-slate-500">Jouw lijstje.</p>
        </div>
        {shoppingListItems.length > 0 && (
          <button onClick={clearList} className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full">
            <Trash2 className="w-3 h-3" /> Wis alles
          </button>
        )}
      </div>

      {shoppingListItems.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {shoppingListItems.map((item, idx) => (
            <div key={idx} className="p-4 border-b border-slate-50 flex items-center gap-3 last:border-0">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-slate-700">{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <ShoppingBasket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Je lijstje is leeg.</p>
          <button onClick={() => setActiveTab('food')} className="mt-4 text-blue-600 font-bold text-sm hover:underline">
            Bekijk recepten
          </button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Standaard Voorraad</h3>
        <div className="grid grid-cols-1 gap-3">
          {["Volkoren Pasta & Rijst", "Havermout & Wraps", "Noten & Pindakaas", "Diepvriesfruit & Groente"].map((item, i) => (
            <div key={i} className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300" /> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
        {/* Main Content Area */}
        <div className="h-full overflow-y-auto p-5 no-scrollbar">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'food' && renderFood()}
          {activeTab === 'circuit' && renderCircuit()}
          {activeTab === 'list' && renderList()}
        </div>
        {/* Modals */}
        {showSettings && <DataManagement onClose={() => setShowSettings(false)} />}

        {showTrainingModal && (
          <TrainingLogModal
            onClose={() => setShowTrainingModal(false)}
            trainingType={plan.type}
          />
        )}

        {/* Navigation Bar */}

        {/* Full Screen Insights Overlay */}
        {showInsights && (
          <div className="absolute inset-0 z-[100] bg-white">
            <Insights onClose={() => setShowInsights(false)} />
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Admin Modal */}
        <DataManagement
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          onDataChanged={loadData}
        />

        {/* Recipe Modal */}
        <Modal
          isOpen={showRecipeModal}
          onClose={() => setShowRecipeModal(false)}
          title={selectedRecipe?.title || "Recept"}
        >
          {selectedRecipe && (
            <div className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                {selectedRecipe.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">{tag}</span>
                ))}
                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {selectedRecipe.time}
                </span>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-900 text-sm mb-3">Ingrediënten</h4>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map(ing => (
                    <li key={ing} className="text-sm text-green-800 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Bereiding</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedRecipe.instructions}</p>
              </div>

              <button
                onClick={addIngredientsToList}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-transform active:scale-95"
              >
                <Plus className="w-5 h-5" /> Zet op Lijst
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}