import React, { useState } from 'react';
import { X, Trophy, Loader2, Dumbbell, Zap } from 'lucide-react';
import { analyzeFuelEfficiency } from '../ai';
import { put, getAll, getSetting } from '../db';
import { addXP } from '../gamification';

export default function TrainingLogModal({ onClose, trainingType = 'Strength' }) {
    const [step, setStep] = useState('input'); // input | analyzing | result
    const [rating, setRating] = useState(7);
    const [duration, setDuration] = useState(60);
    const [notes, setNotes] = useState('');
    const [result, setResult] = useState(null);

    const handleSave = async () => {
        setStep('analyzing');
        try {
            const apiKey = await getSetting('openai_api_key');

            // 1. Save Training Log
            const trainingLog = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                timestamp: Date.now(),
                type: trainingType,
                rating,
                duration,
                notes
            };
            await put('training_logs', trainingLog);
            await addXP(50); // XP for logging workout

            if (!apiKey) {
                // Skip AI if no key
                setStep('result');
                setResult({ score: 0, insight: "Geen AI key, maar workout is gelogd!", recommendation: "Stel je API key in voor analyses." });
                return;
            }

            // 2. Fetch Nutrition (Last 24h)
            const allLogs = await getAll('calorie_logs');
            const yesterday = Date.now() - (24 * 60 * 60 * 1000);
            const recentLogs = allLogs.filter(l => l.timestamp >= yesterday);

            // 3. Analyze
            const analysis = await analyzeFuelEfficiency({ trainingLog, recentNutritionLogs: recentLogs }, apiKey);
            setResult(analysis);
            setStep('result');

        } catch (err) {
            console.error(err);
            setStep('result');
            setResult({ score: "?", insight: "Er ging iets mis met de analyse.", recommendation: "Probeer het later nog eens." });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden">

                {step === 'input' && (
                    <div className="animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
                            <h2 className="text-xl font-bold">Hoe ging het?</h2>
                            <p className="text-orange-100 text-sm">Rate je {trainingType}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Jouw Rating: <span className="text-orange-600 text-lg">{rating}/10</span></label>
                                <input
                                    type="range" min="1" max="10" step="1"
                                    value={rating} onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1 font-bold">
                                    <span>Meh 😫</span>
                                    <span>Beest 🦁</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Duur (min)</label>
                                    <input
                                        type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 border border-slate-200 focus:outline-orange-500"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Notitie (optioneel)</label>
                                    <input
                                        type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Energie, pomp, etc."
                                        className="w-full p-3 bg-slate-50 rounded-xl font-medium text-slate-700 border border-slate-200 focus:outline-orange-500"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                            >
                                Opslaan & Analyseren <Zap className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="p-12 text-center">
                        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                        <h3 className="font-bold text-slate-700 mb-1">Je brandstof checken...</h3>
                        <p className="text-sm text-slate-400">Zoeken naar patronen in je voeding</p>
                    </div>
                )}

                {step === 'result' && result && (
                    <div className="animate-in slide-in-from-bottom duration-500">
                        <div className="bg-slate-900 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Fuel Efficiency Score</h2>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-blue-500 mb-4">
                                {result.score}
                            </div>
                            <p className="font-medium text-slate-200 leading-relaxed mb-4">"{result.insight}"</p>
                        </div>
                        <div className="p-6">
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 items-start">
                                <Zap className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-orange-800 text-sm mb-1">Tip voor volgende keer:</h4>
                                    <p className="text-sm text-orange-900">{result.recommendation}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold"
                            >
                                Sluiten
                            </button>
                        </div>
                    </div>
                )}

                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 rounded-full hover:bg-black/20 text-white z-20">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
