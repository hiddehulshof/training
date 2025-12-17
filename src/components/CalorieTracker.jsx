import React, { useState, useEffect } from 'react';
import { Camera, Plus, BarChart2, ChevronDown, ChevronUp, Keyboard, Send, Activity, X, Edit2, Trash2, TrendingUp } from 'lucide-react';
import FlexSearch from 'flexsearch';
import { processFoodAnalysis, getCoachFeedback } from '../ai';
import { put, getAll, getSetting, deleteItem } from '../db';
import { addXP, updateStreak } from '../gamification';
import MacroTetrisModal from './MacroTetrisModal';

export default function CalorieTracker({ onShowInsights, date = new Date() }) {
    const [goal, setGoal] = useState(2500);
    const [macroGoals, setMacroGoals] = useState({ protein: 150, carbs: 300, fat: 80 });
    const [logs, setLogs] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualText, setManualText] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [todayStats, setTodayStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    // Autocomplete State
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchIndex, setSearchIndex] = useState(null);
    const [foodCache, setFoodCache] = useState({}); // Map ID/Name -> Food Object

    // Review & Edit Log State
    const [reviewData, setReviewData] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showTetrisModal, setShowTetrisModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [date]);

    const loadData = async () => {
        const savedGoal = await getSetting('calorie_goal');
        if (savedGoal) setGoal(parseInt(savedGoal));

        const protein = await getSetting('protein_goal');
        const carbs = await getSetting('carbs_goal');
        const fat = await getSetting('fat_goal');
        if (protein) setMacroGoals({ protein: parseInt(protein), carbs: parseInt(carbs || 300), fat: parseInt(fat || 80) });

        const allLogs = await getAll('calorie_logs');
        // Filter for selected date
        const dateStr = date.toISOString().split('T')[0];
        const selectedLogs = allLogs.filter(l => l.date === dateStr);
        setLogs(selectedLogs);

        // Calculate totals
        const stats = selectedLogs.reduce((acc, curr) => ({
            calories: acc.calories + (curr.calories || 0),
            protein: acc.protein + (curr.protein || 0),
            carbs: acc.carbs + (curr.carbs || 0),
            fat: acc.fat + (curr.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setTodayStats(stats);

        // Initialize Search Index
        initSearchArgs(allLogs);
    };

    const initSearchArgs = async (historyLogs) => {
        const suggestionsStore = await getAll('food_suggestions');

        const index = new FlexSearch.Index({
            tokenize: "forward",
            resolution: 9
        });

        const cache = {};

        // Index Suggestions Store
        suggestionsStore.forEach(item => {
            index.add(item.name, item.name); // Using name as ID for now
            cache[item.name] = item;
        });

        // Index History (Unique items)
        const historyMap = new Map();
        historyLogs.forEach(log => {
            if (log.food && !historyMap.has(log.food) && !cache[log.food]) {
                historyMap.set(log.food, log);
            }
        });

        historyMap.forEach((log, name) => {
            index.add(name, name);
            cache[name] = { ...log, name: log.food, quantity: log.quantity };
        });

        setSearchIndex(index);
        setFoodCache(cache);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await performAnalysis({ imageFile: file });
    };

    const handleManualChange = (e) => {
        const text = e.target.value;
        setManualText(text);

        if (text.length > 1 && searchIndex) {
            const results = searchIndex.search(text, { limit: 5 });
            setSuggestions(results.map(name => foodCache[name]));
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const selectSuggestion = (item) => {
        setManualText(item.name);
        setShowSuggestions(false);

        // Hydrate Review Modal directly without AI
        setReviewData({
            food: item.name,
            quantity: item.quantity || '1 portie',
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            image: null,
            type: getMealTypeByTime()
        });
        setShowReviewModal(true);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualText.trim()) return;

        await performAnalysis({ text: manualText });
        setManualText('');
        setShowManualInput(false);
        setShowSuggestions(false);
    };

    const handleDeleteLog = async (id) => {
        if (confirm("Weet je zeker dat je dit item wilt verwijderen?")) {
            await deleteItem('calorie_logs', id);
            await loadData();
        }
    };

    const handleEditLog = (log) => {
        setReviewData({
            ...log,
            image: log.image || null,
            quantity: log.quantity || '',
            type: log.type || getMealTypeByTime()
        });
        setShowReviewModal(true);
    };

    const performAnalysis = async ({ imageFile, text }) => {
        setIsScanning(true);
        try {
            const apiKey = await getSetting('openai_api_key');
            if (!apiKey) {
                alert("Stel eerst je API Key in bij Instellingen (tandwiel icoon).");
                return;
            }

            let base64Image = null;
            if (imageFile) {
                base64Image = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(imageFile);
                });
            }

            const result = await processFoodAnalysis({ image: base64Image, text }, apiKey);

            // Open Review Modal instead of saving immediately
            setReviewData({
                ...result,
                image: base64Image,
                quantity: result.quantity || '1 portie', // Default if missing
                type: getMealTypeByTime() // Auto-detect meal type
            });
            setShowReviewModal(true);

        } catch (err) {
            alert("AI Analyse mislukt: " + err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const getMealTypeByTime = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Ontbijt';
        if (hour < 15) return 'Lunch';
        if (hour < 17) return 'Tussendoortje';
        return 'Diner';
    };

    const handleSaveLog = async (e) => {
        e.preventDefault();
        if (!reviewData) return;

        const formData = new FormData(e.target);

        const newLog = {
            id: reviewData.id || Date.now(), // Use existing ID if editing
            date: reviewData.date || date.toISOString().split('T')[0],
            timestamp: reviewData.timestamp || Date.now(),
            food: formData.get('food'),
            quantity: formData.get('quantity'),
            type: formData.get('type'),
            calories: parseInt(formData.get('calories')),
            protein: parseInt(formData.get('protein')),
            carbs: parseInt(formData.get('carbs')),
            fat: parseInt(formData.get('fat')),
            image: reviewData.image
        };

        try {
            await put('calorie_logs', newLog);

            // Gamification: Award XP and update streak
            await addXP(10);
            await updateStreak();

            // Learn new food
            const suggestionItem = {
                name: newLog.food,
                calories: newLog.calories,
                protein: newLog.protein,
                carbs: newLog.carbs,
                fat: newLog.fat,
                quantity: newLog.quantity
            };
            await put('food_suggestions', suggestionItem); // Save to DB

            // Update local cache & index
            if (searchIndex && !foodCache[newLog.food]) {
                searchIndex.add(newLog.food, newLog.food);
                setFoodCache(prev => ({ ...prev, [newLog.food]: suggestionItem }));
            }

            await loadData();
            setShowReviewModal(false);
            setReviewData(null);

            // Show confetti or success feedback here if desired
        } catch (err) {
            alert("Opslaan mislukt: " + err.message);
        }
    };

    const handleAnalyzeWeek = async () => {
        setIsAnalyzing(true);
        try {
            const apiKey = await getSetting('openai_api_key');
            const height = await getSetting('user_height');
            const weight = await getSetting('user_weight');

            if (!apiKey) {
                alert("Stel eerst je API Key in bij Instellingen.");
                return;
            }

            // Get last 7 days of logs
            const allLogs = await getAll('calorie_logs');
            // Mock schedule for now if empty or fetch real one
            const schedule = await getAll('events'); // Assuming events store has schedule

            const feedbackData = await getCoachFeedback({
                logs: allLogs.slice(-20), // Send last 20 logs to keep context small
                stats: { height: height || 'Unknown', weight: weight || 'Unknown' },
                schedule: schedule.filter(e => new Date(e.date) >= new Date()) // Future events
            }, apiKey);

            setFeedback(feedbackData.feedback);
            setShowFeedbackModal(true);

        } catch (err) {
            alert("Coach Analyse mislukt: " + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleLogTetrisMeal = async (meal) => {
        try {
            // 1. Process all ingredients
            for (const item of meal.ingredients) {
                // If it's a new "store" item, learn it
                if (item.source === 'store') {
                    const newSuggestion = {
                        name: item.name,
                        calories: Math.round(item.macros.calories),
                        protein: Math.round(item.macros.protein),
                        carbs: Math.round(item.macros.carbs),
                        fat: Math.round(item.macros.fat),
                        quantity: `${item.amount} ${item.unit}`
                    };
                    await put('food_suggestions', newSuggestion);

                    // Update cache
                    if (searchIndex) {
                        searchIndex.add(newSuggestion.name, newSuggestion.name);
                        setFoodCache(prev => ({ ...prev, [newSuggestion.name]: newSuggestion }));
                    }
                }

                // Log the item
                const newLog = {
                    id: Date.now() + Math.random(), // Unique ID
                    date: date.toISOString().split('T')[0],
                    timestamp: Date.now(),
                    food: item.name,
                    quantity: `${item.amount} ${item.unit}`,
                    type: getMealTypeByTime(),
                    calories: Math.round(item.macros.calories),
                    protein: Math.round(item.macros.protein),
                    carbs: Math.round(item.macros.carbs),
                    fat: Math.round(item.macros.fat),
                    image: null
                };
                await put('calorie_logs', newLog);
            }

            // 2. Gamification
            await addXP(25); // Bonus XP for using AI meal
            await updateStreak();

            // 3. UI Updates
            await loadData();
            setShowTetrisModal(false);

            // Optional: Show success
        } catch (err) {
            alert("Fout bij loggen maaltijd: " + err.message);
        }
    };

    const progress = Math.min((todayStats.calories / goal) * 100, 100);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Calorie Tracker</h3>
                    <p className="text-sm text-slate-500">Doel: {goal} kcal</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onShowInsights}
                        className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"
                        title="Statistieken"
                    >
                        <TrendingUp className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleAnalyzeWeek}
                        disabled={isAnalyzing}
                        className="p-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition disabled:opacity-50"
                        title="AI Coach Analyse"
                    >
                        {isAnalyzing ? <Activity className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setShowTetrisModal(true)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition"
                        title="Wat zal ik eten?"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 6V4a2 2 0 0 0-2-2h-3.5a2 2 0 0 0-2 2v2" /><path d="M9 6V4a2 2 0 0 1 2-2h3.5a2 2 0 0 1 2 2v2" /><path d="M3.5 6v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2" /><path d="M12.5 12h-9a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4.5" /></svg>
                    </button>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">{todayStats.calories}</span>
                        <span className="text-xs text-slate-400 block uppercase font-bold">kcal gegeten</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-6 relative">
                <div
                    className={`h-full transition-all duration-1000 ${progress > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Macro's Mini */}
            <div className="flex justify-around text-center mb-6">
                <div>
                    <span className="block text-sm font-bold text-slate-700">{todayStats.protein}g <span className="text-slate-400 font-normal">/ {macroGoals.protein}</span></span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Eiwit</span>
                </div>
                <div>
                    <span className="block text-sm font-bold text-slate-700">{todayStats.carbs}g <span className="text-slate-400 font-normal">/ {macroGoals.carbs}</span></span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Koolh</span>
                </div>
                <div>
                    <span className="block text-sm font-bold text-slate-700">{todayStats.fat}g <span className="text-slate-400 font-normal">/ {macroGoals.fat}</span></span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Vet</span>
                </div>
            </div>

            {/* Deterministic Advice */}
            <div className="mb-6 space-y-2">
                {(() => {
                    const advice = [];
                    const proteinPct = todayStats.protein / macroGoals.protein;
                    const calPct = todayStats.calories / goal;

                    if (calPct > 0.4 && proteinPct < (calPct * 0.7)) {
                        advice.push("⚠️ Tip: Je eiwitten lopen achter op je calorieën. Probeer wat kwark of kip!");
                    }
                    if (todayStats.fat > macroGoals.fat) {
                        advice.push("🚨 Let op: Je vetinname is al bereikt voor vandaag.");
                    }
                    if (todayStats.calories > goal) {
                        advice.push("🔥 Je zit over je calorie doel. Eet de rest van de dag licht.");
                    }
                    if (calPct > 0.5 && proteinPct > 0.5 && todayStats.fat < macroGoals.fat) {
                        advice.push("💪 Lekker bezig! Je macro's zijn mooi in balans.");
                    }

                    if (advice.length === 0 && calPct < 0.3) {
                        advice.push("☕ Goedemorgen! Tijd om te loggen.");
                    }

                    return advice.map((tip, i) => (
                        <div key={i} className="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg flex items-start gap-2">
                            <span>{tip}</span>
                        </div>
                    ));
                })()}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
                {!showManualInput ? (
                    <>
                        <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold cursor-pointer transition ${isScanning ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'}`}>
                            {isScanning ? (
                                <span>Analyseren...</span>
                            ) : (
                                <>
                                    <Camera className="w-5 h-5" />
                                    <span className="text-sm">Scan Voeding</span>
                                </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isScanning} />
                        </label>
                        <button
                            onClick={() => setShowManualInput(true)}
                            className="px-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition font-bold flex items-center gap-2"
                        >
                            <Keyboard className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2 relative">
                        <div className="flex-1 relative">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Bijv: 2 boterhammen met kaas"
                                className="w-full p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={manualText}
                                onChange={handleManualChange}
                                disabled={isScanning}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute bottom-full left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 mb-2 overflow-hidden z-50">
                                    {suggestions.map((item, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className="w-full text-left p-3 hover:bg-blue-50 flex justify-between items-center group transition"
                                            onClick={() => selectSuggestion(item)}
                                        >
                                            <span className="font-bold text-slate-700 text-sm">{item.name}</span>
                                            <span className="text-xs text-slate-400 group-hover:text-blue-500">{item.calories} kcal</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isScanning || !manualText}
                            className="px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isScanning ? '...' : <Send className="w-5 h-5" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowManualInput(false)}
                            className="px-3 text-slate-400 hover:text-slate-600"
                            disabled={isScanning}
                        >
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </form>
                )}

                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition ml-auto"
                >
                    {showHistory ? <ChevronUp className="w-5 h-5" /> : <BarChart2 className="w-5 h-5" />}
                </button>
            </div>

            {/* Recent Logs & History */}
            {showHistory && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-fade-in">
                    <h4 className="font-bold text-slate-800 mb-3 text-sm">Vandaag</h4>
                    <div className="space-y-3">
                        {logs.length === 0 && <p className="text-xs text-slate-400 italic">Nog niets gegeten vandaag.</p>}
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-3 items-center">
                                {log.image && <img src={log.image} alt="food" className="w-10 h-10 rounded-lg object-cover" />}
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-bold text-slate-700 truncate">{log.food}</p>
                                    <p className="text-[10px] text-slate-400 capitalize">{log.type || 'Snack'} • {log.quantity || '1 portie'}</p>
                                </div>
                                <span className="text-sm font-bold text-slate-600">{log.calories}</span>
                                <div className="flex gap-1 ml-2">
                                    <button onClick={() => handleEditLog(log)} className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteLog(log.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {showFeedbackModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setShowFeedbackModal(false)} />
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl pointer-events-auto relative z-10 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-purple-50">
                            <h3 className="font-bold text-lg text-purple-800 flex items-center gap-2">
                                <Activity className="w-5 h-5" /> Coach Feedback
                            </h3>
                            <button onClick={() => setShowFeedbackModal(false)} className="p-1 hover:bg-purple-100 rounded-full text-purple-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-4">
                                {feedback?.map((point, i) => (
                                    <li key={i} className="flex gap-3 text-slate-700">
                                        <span className="font-bold text-purple-500 text-lg">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && reviewData && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
                    <form onSubmit={handleSaveLog} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">

                        {/* Image Header */}
                        <div className="relative h-48 bg-slate-100">
                            {reviewData.image ? (
                                <img src={reviewData.image} alt="Food" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Camera className="w-12 h-12" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowReviewModal(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full backdrop-blur-md hover:bg-black/30 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Even Checken! 👀</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Wat eet je?</label>
                                    <input
                                        name="food"
                                        defaultValue={reviewData.food}
                                        className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hoeveelheid</label>
                                        <input
                                            name="quantity"
                                            defaultValue={reviewData.quantity}
                                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                                        <select
                                            name="type"
                                            defaultValue={reviewData.type}
                                            className="w-full p-3 bg-slate-50 border-none rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        >
                                            <option value="Ontbijt">Ontbijt 🥐</option>
                                            <option value="Lunch">Lunch 🥪</option>
                                            <option value="Diner">Diner 🍝</option>
                                            <option value="Tussendoortje">Snack 🍎</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center border-b border-blue-100 pb-2">
                                        <span className="font-bold text-blue-800">Calorieën</span>
                                        <div className="flex items-center gap-1">
                                            <input
                                                name="calories"
                                                type="number"
                                                defaultValue={reviewData.calories}
                                                className="w-20 text-right font-bold text-blue-600 bg-transparent border-b border-dashed border-blue-300 focus:border-blue-600 outline-none"
                                            />
                                            <span className="text-xs font-bold text-blue-400">kcal</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Eiwit</span>
                                            <input name="protein" type="number" defaultValue={reviewData.protein} className="w-full text-center font-bold text-slate-700 bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Koolh</span>
                                            <input name="carbs" type="number" defaultValue={reviewData.carbs} className="w-full text-center font-bold text-slate-700 bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Vet</span>
                                            <input name="fat" type="number" defaultValue={reviewData.fat} className="w-full text-center font-bold text-slate-700 bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transform hover:scale-[1.02] transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Toevoegen
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
            {showTetrisModal && (
                <MacroTetrisModal
                    remainingMacros={{
                        calories: goal - todayStats.calories,
                        protein: macroGoals.protein - todayStats.protein,
                        carbs: macroGoals.carbs - todayStats.carbs,
                        fat: macroGoals.fat - todayStats.fat
                    }}
                    onClose={() => setShowTetrisModal(false)}
                    onLogMeal={handleLogTetrisMeal}
                />
            )}
        </div>
    );
}
