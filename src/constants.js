import React from 'react';

// NB: If these contain JSX (like icons), this file must be .jsx!
// But wait, the original data in App.jsx had NO JSX in the data objects themselves, 
// except maybe for icons? 
// Let's check the data structure.
// RECIPES -> strings, arrays. Safe.
// SPECIAL_DATES -> { type, title, details, icon: "string" }. Safe.
// CIRCUIT_EXERCISES -> { id, title, reps, desc }. Safe.

// So this can be a .js file.

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
