import React, { useState, useEffect } from 'react';
import { Camera, Plus, BarChart2, ChevronDown, ChevronUp, Keyboard, Send, Activity, X } from 'lucide-react';
import { processFoodAnalysis, getCoachFeedback } from '../ai';
import { put, getAll, getSetting } from '../db';

export default function CalorieTracker() {
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const savedGoal = await getSetting('calorie_goal');
        if (savedGoal) setGoal(parseInt(savedGoal));

        const protein = await getSetting('protein_goal');
        const carbs = await getSetting('carbs_goal');
        const fat = await getSetting('fat_goal');
        if (protein) setMacroGoals({ protein: parseInt(protein), carbs: parseInt(carbs || 300), fat: parseInt(fat || 80) });

        const allLogs = await getAll('calorie_logs');
        // Filter for today
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysLogs = allLogs.filter(l => l.date === todayStr);
        setLogs(todaysLogs);

        // Calculate totals
        const stats = todaysLogs.reduce((acc, curr) => ({
            calories: acc.calories + (curr.calories || 0),
            protein: acc.protein + (curr.protein || 0),
            carbs: acc.carbs + (curr.carbs || 0),
            fat: acc.fat + (curr.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setTodayStats(stats);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        await performAnalysis({ imageFile: file });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!manualText.trim()) return;

        await performAnalysis({ text: manualText });
        setManualText('');
        setShowManualInput(false);
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

            // Save log
            const newLog = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now(),
                ...result,
                image: base64Image // Optional
            };

            await put('calorie_logs', newLog);
            await loadData();

        } catch (err) {
            alert("AI Analyse mislukt: " + err.message);
        } finally {
            setIsScanning(false);
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
                        onClick={handleAnalyzeWeek}
                        disabled={isAnalyzing}
                        className="p-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition disabled:opacity-50"
                        title="AI Coach Analyse"
                    >
                        {isAnalyzing ? <Activity className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
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
                    <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Bijv: 2 boterhammen met kaas"
                            className="flex-1 p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            disabled={isScanning}
                        />
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
                                    <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <span className="text-sm font-bold text-slate-600">{log.calories}</span>
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
        </div>
    );
}
