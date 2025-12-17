import React from 'react';
import {
    Trophy, Moon, Dumbbell, Zap, Coffee, Info
} from 'lucide-react';

export const getIcon = (iconName, className = "w-6 h-6") => {
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

export const getTheme = (type) => {
    switch (type) {
        case "match": return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-50", border: "border-red-200" };
        case "training": return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200" };
        case "sleep": return { bg: "bg-indigo-500", text: "text-indigo-600", light: "bg-indigo-50", border: "border-indigo-200" };
        case "strength": return { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50", border: "border-orange-200" };
        case "power": return { bg: "bg-yellow-500", text: "text-yellow-600", light: "bg-yellow-50", border: "border-yellow-200" };
        default: return { bg: "bg-slate-500", text: "text-slate-600", light: "bg-slate-50", border: "border-slate-200" };
    }
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

export const getDayPlan = (dateStr, dayIndex, events) => {
    let basePlan = (events && events[dateStr]) ? events[dateStr] : getRoutinePlan(dayIndex);
    const nutrition = getDetailedNutrition(dayIndex, basePlan.type);
    return { ...basePlan, nutrition };
};
