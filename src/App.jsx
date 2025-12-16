import React, { useState, useEffect } from 'react';
import { Calendar, Moon, Zap, Trophy, Dumbbell, Coffee, Info, ChevronLeft, ChevronRight, Utensils, CheckCircle, Droplets, Apple, Carrot, Beef, ShoppingBasket, Dices, Plus, Trash2 } from 'lucide-react';

// --- DATA & LOGIC ---

const RECIPES = [
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
  },
  {
    id: 13,
    title: "Gnocchi Traybake",
    tags: ["Oven (Makkie)", "Vega"],
    time: "25 min",
    ingredients: ["Gnocchi (vers)", "Courgette", "Rode Paprika", "Mozzarella bolletjes", "Pesto rood"],
    instructions: "Meng gnocchi en gesneden groente met pesto op de bakplaat. 20 min in oven op 200gr. Laatste 5 min mozzarella erover."
  },
  {
    id: 14,
    title: "Snelle Pita Pizza's",
    tags: ["Peuter Hit", "Snel"],
    time: "15 min",
    ingredients: ["Volkoren pita broodjes", "Tomatenpuree", "Salami of Ham", "Paprika reepjes", "Geraspte kaas"],
    instructions: "Snijd pita's open. Besmeer met puree. Beleg met toppings en kaas. 8 min in de oven tot kaas smelt."
  },
  {
    id: 15,
    title: "Romige Pasta met Zalm & Spinazie",
    tags: ["Vis", "Snel"],
    time: "15 min",
    ingredients: ["Tagliatelle", "Gerookte zalmsnippers", "Kruidenkaas (Boursin)", "Verse spinazie", "Cherrytomaatjes"],
    instructions: "Kook pasta. Verwarm kruidenkaas in een wok, voeg spinazie toe tot het slinkt. Roer zalm en pasta erdoor."
  },
  {
    id: 16,
    title: "Milde Kip Korma Curry",
    tags: ["Wereldgerecht", "Rijst"],
    time: "20 min",
    ingredients: ["Kipfilet", "Korma boemboe (mild)", "Kokosmelk", "Sperziebonen", "Zilvervliesrijst"],
    instructions: "Kook rijst en bonen. Bak kip goudbruin. Voeg boemboe en kokosmelk toe. Laat even pruttelen met de bonen."
  },
  {
    id: 17,
    title: "Broodje Hamburger (Gezond)",
    tags: ["Weekend", "Vlees"],
    time: "20 min",
    ingredients: ["Tartaartjes", "Volkoren bollen", "IJsbergsla", "Komkommer", "Saus naar keuze"],
    instructions: "Bak tartaartjes gaar. Snijd broodjes open. Beleg met veel groenten, het vlees en een klein beetje saus."
  },
  {
    id: 18,
    title: "Couscous Salade met Feta",
    tags: ["Koud", "Lunch/Diner"],
    time: "10 min",
    ingredients: ["Couscous", "Komkommer", "Feta blokjes", "Rozijnen", "Munt (vers)"],
    instructions: "Wel de couscous in heet water (5 min). Snijd groente en munt fijn. Meng alles door elkaar. Lekker fris!"
  },
  {
    id: 19,
    title: "Chinese Tomatensoep (Kidsproof)",
    tags: ["Soep", "Zoet"],
    time: "20 min",
    ingredients: ["Gezeefde tomaten", "Kipfilet (gekookt)", "Taugé", "Chinese Mie", "Appelmoes (geheim)"],
    instructions: "Verwarm tomaten met bouillon. Roer lepel appelmoes erdoor voor het zoetje. Voeg mie, kip en taugé toe."
  },
  {
    id: 20,
    title: "Quesadillas met Avocado",
    tags: ["Vega", "Lunch"],
    time: "15 min",
    ingredients: ["Wraps", "Cheddar kaas", "Avocado", "Bosui", "Mais"],
    instructions: "Prak avocado. Smeer op wrap, strooi kaas, mais en ui erover. Dek af met 2e wrap. Bak in koekenpan aan beide kanten."
  },
  {
    id: 21,
    title: "Orzo 'Risotto' met Champignons",
    tags: ["One-pot", "Vega"],
    time: "20 min",
    ingredients: ["Orzo (pasta)", "Champignons", "Bouillonblokje", "Parmezaanse kaas", "Doperwten"],
    instructions: "Bak champignons. Voeg orzo en bouillon toe. Kook droog als rijst. Roer op het eind kaas en doperwten erdoor."
  },
  {
    id: 22,
    title: "Kabeljauw met Spek uit de Oven",
    tags: ["Vis", "Oven (Makkie)"],
    time: "25 min",
    ingredients: ["Kabeljauwfilet", "Ontbijtspek", "Krieltjes", "Broccoli", "Citroen"],
    instructions: "Wikkel vis in spek. Leg met krieltjes en broccoli op bakplaat. Besprenkel met olie. 20 min in oven op 200gr."
  },
  {
    id: 23,
    title: "Falafel Wraps met Yoghurt",
    tags: ["Vega", "Snel"],
    time: "15 min",
    ingredients: ["Falafel balletjes", "Volkoren Wraps", "Rode kool (pot)", "Griekse Yoghurt", "Knoflook"],
    instructions: "Bak falafel krokant. Maak sausje van yoghurt/knoflook. Vul wraps met kool, falafel en saus."
  },
  {
    id: 24,
    title: "Rösti Ovenschotel met Prei",
    tags: ["Comfort", "Oven"],
    time: "35 min",
    ingredients: ["Rösti rondjes (diepvries)", "Prei", "Spekjes", "Crème fraîche", "Geraspte kaas"],
    instructions: "Bak spekjes en prei. Meng met crème fraîche. Doe in ovenschaal, dek af met rösti rondjes en kaas. 25 min oven."
  },
  {
    id: 25,
    title: "Snelle Nasi met Saté",
    tags: ["Prep", "Aziatisch"],
    time: "20 min",
    ingredients: ["Witte rijst (afgekoeld)", "Nasi groentepakket", "Eieren", "Kant-en-klare satéstokjes", "Kroepoek"],
    instructions: "Bak groenten. Voeg rijst toe en bak op hoog vuur. Kluts ei erdoorheen (scramble). Serveer met opgewarmde saté."
  },
  {
    id: 26,
    title: "Tortilla Taart",
    tags: ["Feestje", "Oven"],
    time: "30 min",
    ingredients: ["Wraps", "Rundergehakt", "Bonen in tomatensaus", "Mais", "Geraspte kaas"],
    instructions: "Rul gehakt met bonen/mais. Stapel in springvorm: wrap, saus, wrap, saus. Eindig met kaas. 15 min in oven."
  },
  {
    id: 27,
    title: "Teriyaki Noedels met Biefstuk",
    tags: ["Snel", "Luxe"],
    time: "15 min",
    ingredients: ["Woknoedels", "Biefstukpuntjes", "Broccoli roosjes", "Teriyaki saus", "Sesamzaadjes"],
    instructions: "Wok biefstuk en broccoli hard en snel. Voeg saus en noedels toe (direct uit pak). Bestrooi met sesam."
  },
  {
    id: 28,
    title: "Maaltijdsalade Geitenkaas",
    tags: ["Koud", "Vega"],
    time: "10 min",
    ingredients: ["Gemengde sla", "Geitenkaas rondjes", "Walnoten", "Honing", "Appel"],
    instructions: "Doe sla in kom. Snijd appel in partjes. Verdeel kaas en noten. Besprenkel royaal met honing."
  },
  {
    id: 29,
    title: "Spruitjesstamppot met Spekjes",
    tags: ["Winter", "Hollandse pot"],
    time: "25 min",
    ingredients: ["Aardappels", "Spruitjes (geschoond)", "Spekjes", "Melk", "Mosterd"],
    instructions: "Kook aardappels en spruitjes samen gaar. Bak spekjes uit. Stamp alles met scheutje melk en lepel mosterd."
  },
  {
    id: 30,
    title: "Shakshuka (Eieren in Saus)",
    tags: ["Vega", "Eiwitrijk"],
    time: "20 min",
    ingredients: ["Eieren", "Paprika", "Tomatenblokjes (blik)", "Ui", "Komijnpoeder"],
    instructions: "Fruit ui en paprika. Voeg tomaat en kruiden toe. Maak kuiltjes in saus, breek eieren erin. Deksel erop tot ei stolt."
  }
];

const SPECIAL_DATES = {
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

const getDayPlan = (dateStr, dayIndex) => {
  let basePlan = SPECIAL_DATES[dateStr] ? SPECIAL_DATES[dateStr] : getRoutinePlan(dayIndex);
  const nutrition = getDetailedNutrition(dayIndex, basePlan.type);
  return { ...basePlan, nutrition };
};

const getColorClass = (type) => {
  switch (type) {
    case "match": return "bg-red-50 border-red-500 text-red-900";
    case "training": return "bg-blue-50 border-blue-500 text-blue-900";
    case "sleep": return "bg-indigo-50 border-indigo-500 text-indigo-900";
    case "strength": return "bg-orange-50 border-orange-500 text-orange-900";
    case "power": return "bg-yellow-50 border-yellow-500 text-yellow-900";
    default: return "bg-gray-50 border-gray-400 text-gray-800";
  }
};

const getIcon = (iconName) => {
  switch (iconName) {
    case "trophy": return <Trophy className="w-6 h-6" />;
    case "volleyball": return <div className="text-xl">🏐</div>; 
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
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">✕</button>
        {children}
      </div>
    </div>
  );
};

const HabitTracker = ({ dateStr }) => {
  const [habits, setHabits] = useState({ water: false, fruit: false, veggies: false, protein: false });
  const toggle = (key) => setHabits(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mt-4">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Dagelijkse Checklist</h3>
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => toggle('water')} className={`flex flex-col items-center p-2 rounded-lg transition ${habits.water ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
          <Droplets className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">2L Water</span>
        </button>
        <button onClick={() => toggle('fruit')} className={`flex flex-col items-center p-2 rounded-lg transition ${habits.fruit ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
          <Apple className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">2x Fruit</span>
        </button>
        <button onClick={() => toggle('veggies')} className={`flex flex-col items-center p-2 rounded-lg transition ${habits.veggies ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
          <Carrot className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Groente</span>
        </button>
        <button onClick={() => toggle('protein')} className={`flex flex-col items-center p-2 rounded-lg transition ${habits.protein ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-400'}`}>
          <Beef className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Eiwit</span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCircuit, setShowCircuit] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  
  // Recipe Roulette State
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shoppingListItems, setShoppingListItems] = useState([]);

  const toISODate = (d) => d.toISOString().split('T')[0];
  const getDayName = (d) => d.toLocaleDateString('nl-NL', { weekday: 'long' });
  const getNiceDate = (d) => d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });

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

  // Logic to pick a random recipe
  const spinRecipe = () => {
    const random = RECIPES[Math.floor(Math.random() * RECIPES.length)];
    setSelectedRecipe(random);
    setShowRecipeModal(true);
  };

  // Logic to add ingredients to shopping list
  const addIngredientsToList = () => {
    if (selectedRecipe) {
      // Avoid duplicates roughly
      const newItems = selectedRecipe.ingredients.filter(item => !shoppingListItems.includes(item));
      setShoppingListItems(prev => [...prev, ...newItems]);
      setShowRecipeModal(false);
      setShowGroceryList(true); // Open list to confirm
    }
  };

  const clearCustomList = () => {
      setShoppingListItems([]);
  };

  const dateStr = toISODate(currentDate);
  const plan = getDayPlan(dateStr, currentDate.getDay());
  const isToday = toISODate(new Date()) === dateStr;

  const getWeekDays = (baseDate) => {
    const days = [];
    const currentDayIndex = baseDate.getDay() || 7;
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
        <div className="max-w-md mx-auto flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Volleybal & Voeding</h1>
                <p className="text-xs text-blue-200">Gezond eten = Beter spelen</p>
              </div>
              <button 
                onClick={spinRecipe}
                className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-3 py-2 rounded-full transition flex items-center gap-1 shadow-md font-bold text-xs animate-pulse"
              >
                <Dices className="w-4 h-4" /> Wat eten we?
              </button>
            </div>

            <div className="flex gap-2 justify-center">
                <button 
                    onClick={() => setShowGroceryList(true)}
                    className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-full transition flex items-center gap-1"
                >
                    <ShoppingBasket className="w-3 h-3" /> Lijst {shoppingListItems.length > 0 && `(${shoppingListItems.length})`}
                </button>
                <button 
                    onClick={() => setShowCircuit(true)}
                    className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-full transition"
                >
                    Mijn Circuit
                </button>
            </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-5">
        
        {/* DATE NAVIGATION */}
        <div className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm">
          <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
          <div className="text-center cursor-pointer" onClick={resetToday}>
            <div className="text-xs text-gray-500 uppercase font-bold">{isToday ? "VANDAAG" : getDayName(currentDate)}</div>
            <div className="font-semibold">{getNiceDate(currentDate)}</div>
          </div>
          <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* HERO CARD (ACTIVITY) */}
        <div className={`p-5 rounded-2xl shadow-sm border-l-8 flex items-center gap-4 transition-colors duration-300 ${getColorClass(plan.type)}`}>
          <div className="bg-white bg-opacity-40 p-3 rounded-full shrink-0">
            {getIcon(plan.icon)}
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">{plan.title}</h2>
            <p className="text-sm font-medium opacity-90">{plan.details}</p>
             {plan.type === "strength" && (
                <button onClick={() => setShowCircuit(true)} className="text-xs underline mt-1 font-bold">Bekijk oefeningen</button>
             )}
          </div>
        </div>

        {/* NUTRITION & FAMILY PLANNER (EXPANDED) */}
        <div className="bg-green-50 rounded-2xl p-5 border border-green-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Utensils className="w-24 h-24 text-green-800" />
          </div>
          
          <h3 className="text-green-900 font-bold text-lg mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5" /> Brandstof & Gezin
          </h3>

          <div className="space-y-4 relative z-10">
            {/* Breakfast/Lunch/Dinner List */}
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded w-16 text-center shrink-0">LUNCH</span>
                <p className="text-sm text-green-900 leading-snug">{plan.nutrition.lunch}</p>
              </div>
              
              <div className="flex gap-3 items-start">
                <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-1 rounded w-16 text-center shrink-0">DINER</span>
                <p className="text-sm text-green-900 leading-snug">{plan.nutrition.dinner}</p>
              </div>

              {plan.nutrition.snack && (
                <div className="flex gap-3 items-start">
                  <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded w-16 text-center shrink-0">SNACK</span>
                  <p className="text-sm text-green-900 leading-snug font-medium">{plan.nutrition.snack}</p>
                </div>
              )}
            </div>

            {/* Family Tip Box */}
            <div className="bg-white bg-opacity-60 rounded-lg p-3 mt-2 border-l-4 border-green-500">
               <p className="text-xs text-green-800 italic">
                 <strong>👨‍👩‍👧‍👦 Gezin Tip:</strong> {plan.nutrition.familyTip}
               </p>
            </div>
          </div>
        </div>

        {/* HABIT TRACKER */}
        <HabitTracker dateStr={dateStr} />

        {/* WEEK OVERVIEW */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Deze Week</h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
            {weekDays.map((d) => {
              const dStr = toISODate(d);
              const p = getDayPlan(dStr, d.getDay());
              const isSelected = dStr === dateStr;
              const isRealToday = dStr === toISODate(new Date());

              // SAFE SPLIT: Prevents crash if dinner is missing
              const dinnerShort = p.nutrition?.dinner ? p.nutrition.dinner.split(':')[0] : 'Geen info';

              return (
                <div 
                  key={dStr} 
                  onClick={() => setCurrentDate(d)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 text-center text-xs font-bold ${isRealToday ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div>{d.toLocaleDateString('nl-NL', { weekday: 'short' }).toUpperCase()}</div>
                      <div className="text-sm">{d.getDate()}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-700">{p.title}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[150px]">{dinnerShort}</div>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-full ${p.type === 'match' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                    {p.type === 'match' ? <Trophy className="w-3 h-3" /> : (p.type === 'strength' ? <Dumbbell className="w-3 h-3"/> : <div className="w-3 h-3 rounded-full bg-current opacity-20"/>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CIRCUIT MODAL */}
      <Modal isOpen={showCircuit} onClose={() => setShowCircuit(false)}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-blue-600" /> Jouw Kracht Circuit
        </h2>
        <p className="text-sm text-gray-500 mb-4">Doe 3 rondes. 90 sec rust tussen rondes.</p>
        
        <ul className="space-y-4 text-sm">
          <li className="flex gap-3"><div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">1</div><div><span className="font-bold block">Banded Squats</span><span className="text-gray-600">15x. Op band staan, uiteinden bij schouders.</span></div></li>
          <li className="flex gap-3"><div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">2</div><div><span className="font-bold block">Jump Squats</span><span className="text-gray-600">8-10x. Explosief omhoog, zacht landen!</span></div></li>
          <li className="flex gap-3"><div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">3</div><div><span className="font-bold block">Band Pull-Aparts</span><span className="text-gray-600">15-20x. Armen gestrekt, band naar borst trekken.</span></div></li>
          <li className="flex gap-3"><div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">4</div><div><span className="font-bold block">Monster Walks</span><span className="text-gray-600">20 stap links/rechts. Band om enkels/knieën.</span></div></li>
          <li className="flex gap-3"><div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">5</div><div><span className="font-bold block">Overhead Press</span><span className="text-gray-600">10-12x. Op band staan, uitduwen boven hoofd.</span></div></li>
          <li className="flex gap-3"><div className="bg-blue-100 text-blue-800 font-bold w-6 h-6 rounded flex items-center justify-center shrink-0">6</div><div><span className="font-bold block">Plank</span><span className="text-gray-600">45-60 sec. Navel intrekken.</span></div></li>
        </ul>
        <button onClick={() => setShowCircuit(false)} className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Sluiten</button>
      </Modal>

      {/* GROCERY LIST MODAL */}
      <Modal isOpen={showGroceryList} onClose={() => setShowGroceryList(false)}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShoppingBasket className="w-5 h-5 text-green-600" /> Boodschappenlijst
        </h2>

        {/* Dynamic Items from Recipe */}
        {shoppingListItems.length > 0 && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-yellow-800 uppercase">Toegevoegd voor Recept</h3>
                    <button onClick={clearCustomList} className="text-xs text-red-500 flex items-center hover:underline"><Trash2 className="w-3 h-3 mr-1"/> Wis</button>
                </div>
                <ul className="text-sm space-y-2">
                    {shoppingListItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}

        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b">Voorraadkast (Basis)</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
                    <li>Volkoren Pasta & Zilvervliesrijst</li>
                    <li>Havermout & Wraps</li>
                    <li>Noten, Pindakaas & Peulvruchten</li>
                    <li>Tomatenblokjes & Tonijn (blik)</li>
                </ul>
            </div>
            <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b">Vers & Koeling</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
                    <li>Magere Kwark & Eieren</li>
                    <li>Komkommer, Tomaten, Worteltjes</li>
                    <li>Hüttenkäse & Humus</li>
                </ul>
            </div>
             <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 border-b">Diepvries & Snacks</h3>
                <ul className="text-sm space-y-1 list-disc list-inside text-gray-600">
                    <li>Diepvriesfruit & Groenten (Erwten/Spinazie)</li>
                    <li>Kipfiletblokjes</li>
                    <li>Bananen & Ontbijtkoek</li>
                </ul>
            </div>
        </div>
        <button onClick={() => setShowGroceryList(false)} className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">Sluiten</button>
      </Modal>

      {/* RECIPE ROULETTE MODAL */}
      <Modal isOpen={showRecipeModal} onClose={() => setShowRecipeModal(false)}>
        {selectedRecipe && (
            <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <span className="text-3xl">🍲</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedRecipe.title}</h2>
                <div className="flex justify-center gap-2 mb-4">
                    {selectedRecipe.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">⏱ {selectedRecipe.time}</span>
                </div>

                <div className="bg-green-50 p-4 rounded-lg text-left mb-4 border border-green-100">
                    <h3 className="font-bold text-green-800 text-sm mb-2">Ingrediënten:</h3>
                    <ul className="text-sm text-gray-700 list-disc list-inside">
                        {selectedRecipe.ingredients.map(ing => <li key={ing}>{ing}</li>)}
                    </ul>
                </div>

                <div className="text-left mb-6">
                    <h3 className="font-bold text-gray-800 text-sm mb-1">Zo maak je het:</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedRecipe.instructions}</p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={addIngredientsToList}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> Zet op Boodschappenlijst
                    </button>
                    
                    <button 
                        onClick={spinRecipe}
                        className="w-full bg-white border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <Dices className="w-4 h-4" /> Ander Recept
                    </button>
                </div>
            </div>
        )}
      </Modal>

    </div>
  );
}
