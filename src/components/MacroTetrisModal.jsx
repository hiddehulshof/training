import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, ShoppingBag, Utensils, Check } from 'lucide-react';
import { generateMealSuggestion } from '../ai';
import { getAll, getSetting } from '../db';

export default function MacroTetrisModal({ remainingMacros, onClose, onLogMeal }) {
    const [isLoading, setIsLoading] = useState(true);
    const [suggestion, setSuggestion] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSuggestion();
    }, []);

    const fetchSuggestion = async () => {
        try {
            const apiKey = await getSetting('openai_api_key');
            if (!apiKey) throw new Error("API Key ontbreekt (zie instellingen).");

            // 1. Pantry Algorithm
            const allLogs = await getAll('calorie_logs');
            const suggestions = await getAll('food_suggestions');

            // Count frequencies
            const counts = {};
            allLogs.forEach(log => {
                counts[log.food] = (counts[log.food] || 0) + 1;
            });

            // Sort by frequency
            let pantry = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

            // Fallback if low history
            if (pantry.length < 5) {
                const defaults = suggestions.map(s => s.name);
                // Combine and dedup
                pantry = [...new Set([...pantry, ...defaults])];
            }

            // Take top 20
            const topPantry = pantry.slice(0, 20);

            // 2. Call AI
            const result = await generateMealSuggestion({
                remainingMacros,
                pantryItems: topPantry
            }, apiKey);

            setSuggestion(result);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = () => {
        if (!suggestion) return;
        onLogMeal(suggestion);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shrink-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                            <h2 className="text-xl font-bold">Macro Tetris</h2>
                        </div>
                        <button onClick={onClose} className="p-1 bg-white/20 rounded-full hover:bg-white/30 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-indigo-100 text-sm">
                        Resterend: {remainingMacros.calories} kcal • {remainingMacros.protein}g eiwit
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                            <p className="font-medium text-slate-600">Puzzelen met ingrediënten...</p>
                            <p className="text-xs text-slate-400 mt-2">Checking pantry & macro's</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500 font-bold mb-2">Oeps, foutje!</p>
                            <p className="text-sm text-slate-500 mb-4">{error}</p>
                            <button onClick={onClose} className="text-indigo-600 font-bold">Sluiten</button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Meal Title */}
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-slate-800 mb-1">{suggestion.meal_name}</h3>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${suggestion.match_score > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {suggestion.match_score}% Match
                                </span>
                            </div>

                            {/* Ingredient List */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Boodschappenlijst</h4>
                                {suggestion.ingredients.map((item, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${item.source === 'store' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.source === 'store' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.source === 'store' ? <ShoppingBag className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-700">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.amount} {item.unit} • {item.macros.calories} kcal</p>
                                        </div>
                                        {item.source === 'store' && (
                                            <span className="text-[10px] font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Kopen</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-4 gap-2 text-center">
                                {['calories', 'protein', 'carbs', 'fat'].map(metric => {
                                    const total = suggestion.ingredients.reduce((acc, curr) => acc + (curr.macros[metric] || 0), 0);
                                    return (
                                        <div key={metric}>
                                            <span className="block text-lg font-bold text-slate-700">{Math.round(total)}{metric === 'calories' ? '' : 'g'}</span>
                                            <span className="text-[10px] uppercase text-slate-400 font-bold">{metric === 'calories' ? 'kcal' : metric}</span>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isLoading && !error && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                        <button
                            onClick={handleAccept}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <Check className="w-5 h-5" /> Log Dit Maaltje
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
