import React, { useState, useEffect } from 'react';
import { BarChart2, Calendar, ChevronLeft, ChevronRight, TrendingUp, Award, Flame, Sparkles, Loader2 } from 'lucide-react';
import { getAll, getSetting } from '../db';
import { getUserStats } from '../gamification';
import { analyzeProgress } from '../ai';

export default function Insights({ onClose }) {
    const [timeframe, setTimeframe] = useState('week'); // 'week' or 'month'
    const [metric, setMetric] = useState('calories'); // 'calories', 'protein', 'carbs', 'fat'
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0, max: 0, streak: 0 });
    const [goal, setGoal] = useState(2500);
    const [macroGoals, setMacroGoals] = useState({ protein: 150, carbs: 300, fat: 80 });
    const [allLogs, setAllLogs] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (allLogs.length > 0) processData(allLogs);
    }, [allLogs, timeframe, metric]);

    const loadData = async () => {
        const savedGoal = await getSetting('calorie_goal');
        if (savedGoal) setGoal(parseInt(savedGoal));

        const savedMacros = await getSetting('macro_goals');
        if (savedMacros) setMacroGoals(savedMacros);

        const logs = await getAll('calorie_logs');

        const userStats = await getUserStats();
        setStats(prev => ({ ...prev, streak: userStats.streak }));

        // DEBUG: If no logs, add dummy data to verify chart works
        if (logs.length === 0) {
            console.log("No logs found. Generating dummy data for chart test.");
            const dummyLogs = [];
            const today = new Date();
            for (let i = 0; i < 30; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                dummyLogs.push({
                    date: dateStr,
                    calories: Math.floor(Math.random() * 1000) + 1500,
                    protein: Math.floor(Math.random() * 50) + 100,
                    carbs: Math.floor(Math.random() * 100) + 200,
                    fat: Math.floor(Math.random() * 40) + 50
                });
            }
            setAllLogs(dummyLogs);
        } else {
            setAllLogs(logs);
        }
    };

    const processData = (logs) => {
        const end = new Date();
        const start = new Date();
        const dates = [];

        if (timeframe === 'week') {
            start.setDate(end.getDate() - 6); // Last 7 days
        } else {
            start.setDate(end.getDate() - 29); // Last 30 days
        }

        // Generate date range
        // Fix: Use a new variable for iteration to avoid messing up the loop
        let currentDate = new Date(start);
        while (currentDate <= end) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`Generated ${dates.length} dates from ${dates[0]} to ${dates[dates.length - 1]}`);

        // Group by date
        const grouped = logs.reduce((acc, log) => {
            if (!acc[log.date]) acc[log.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            acc[log.date].calories += parseInt(log.calories || 0);
            acc[log.date].protein += parseInt(log.protein || 0);
            acc[log.date].carbs += parseInt(log.carbs || 0);
            acc[log.date].fat += parseInt(log.fat || 0);
            return acc;
        }, {});

        // Build chart array
        let totalCals = 0;
        let maxCals = 0;
        let daysWithData = 0;

        const data = dates.map(date => {
            const entry = grouped[date] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
            const val = entry[metric];
            totalCals += val;
            if (val > maxCals) maxCals = val;
            if (val > 0) daysWithData++;

            const dObj = new Date(date);
            return {
                date,
                label: timeframe === 'week'
                    ? dObj.toLocaleDateString('nl-NL', { weekday: 'short' })
                    : dObj.getDate(),
                value: val
            };
        });

        setChartData(data);
        setStats(prev => ({
            ...prev, // Preserve existing streak
            average: daysWithData > 0 ? Math.round(totalCals / daysWithData) : 0,
            total: totalCals,
            max: maxCals,
            // Streak is handled by gamification stats now
        }));
    };

    const calculateStreak = (logs) => {
        // Simple distinct consecutive days logic could go here
        return 0;
    };

    const getCurrentGoal = () => {
        if (metric === 'calories') return goal;
        return macroGoals[metric] || 0;
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const apiKey = await getSetting('openai_api_key');
            if (!apiKey) {
                alert("Stel eerst je API Key in bij Instellingen.");
                setIsAnalyzing(false);
                return;
            }

            // Prepare data: summarize stats for last 30 days
            const summary = {
                averageCalories: stats.average,
                totalCalories: stats.total,
                streak: stats.streak
            };

            const result = await analyzeProgress({ logs: summary, goals: { calories: goal, ...macroGoals } }, apiKey);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            alert("Analyse mislukt: " + error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const currentGoal = getCurrentGoal();
    const maxVal = Math.max(stats.max, currentGoal * 1.2);

    const METRICS = [
        { id: 'calories', label: 'Kcal', color: 'blue' },
        { id: 'protein', label: 'Eiwit', color: 'red' },
        { id: 'carbs', label: 'Koolh', color: 'green' },
        { id: 'fat', label: 'Vetten', color: 'yellow' },
    ];

    const activeColor = METRICS.find(m => m.id === metric)?.color || 'blue';

    return (
        <div className="bg-white min-h-screen text-slate-800 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 flex items-center gap-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-blue-600" /> Statistieken
                    {stats.streak > 0 && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">🔥 {stats.streak} dagen</span>}
                </h2>
            </div>

            <div className="p-6 space-y-8">
                {/* Timeframe Toggle */}
                <div className="bg-slate-100 p-1 rounded-xl flex font-bold text-sm">
                    <button
                        onClick={() => setTimeframe('week')}
                        className={`flex-1 py-2 rounded-lg transition ${timeframe === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Deze Week
                    </button>
                    <button
                        onClick={() => setTimeframe('month')}
                        className={`flex-1 py-2 rounded-lg transition ${timeframe === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Deze Maand
                    </button>
                </div>

                {/* AI Analysis Button (Only visible in Month view) */}
                {timeframe === 'month' && !analysis && (
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isAnalyzing ? 'Analyseren...' : 'Start AI Maand Analyse'}
                    </button>
                )}

                {/* Analysis Result */}
                {analysis && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 animate-in slide-in-from-bottom duration-500">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-indigo-600" />
                            <h3 className="font-bold text-indigo-800">Jouw Maand Analyse</h3>
                        </div>
                        <p className="text-sm text-indigo-900 mb-4 leading-relaxed">{analysis.summary}</p>
                        <div className="space-y-2">
                            {analysis.tips.map((tip, i) => (
                                <div key={i} className="flex gap-2 items-start bg-white p-3 rounded-lg shadow-sm">
                                    <span className="text-indigo-500 font-bold text-xs mt-0.5">{i + 1}.</span>
                                    <p className="text-xs text-slate-700 font-medium">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Metric Selector */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {METRICS.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMetric(m.id)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${metric === m.id ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`bg-${activeColor}-50 p-4 rounded-2xl border border-${activeColor}-100`}>
                        <div className={`flex items-center gap-2 text-${activeColor}-600 mb-1`}>
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Gemiddeld</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{stats.average} <span className="text-xs font-normal text-slate-500">{metric === 'calories' ? 'kcal' : 'g'}</span></p>
                    </div>
                    <div className={`bg-${activeColor}-50 p-4 rounded-2xl border border-${activeColor}-100`}>
                        <div className={`flex items-center gap-2 text-${activeColor}-600 mb-1`}>
                            <Flame className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Totaal</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">
                            {metric === 'calories' ? (stats.total / 1000).toFixed(1) + 'k' : stats.total}
                            <span className="text-xs font-normal text-slate-500">{metric === 'calories' ? 'kcal' : 'g'}</span>
                        </p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl">
                    <h3 className="font-bold text-slate-800 mb-6 capitalize">{metric} Verloop</h3>

                    {/* DEBUG: Verify dates */}
                    {/* <div className="text-xs text-slate-400 mb-2">DEBUG: {dates[0]} - {dates[dates.length-1]} ({dates.length} days)</div> */}

                    <div className={`flex justify-between h-48 relative ${timeframe === 'month' ? 'gap-0.5' : 'gap-2'}`}>
                        {/* Goal Line */}
                        <div
                            className="absolute left-0 right-0 border-t-2 border-dashed border-slate-300 z-0 opacity-50 pointer-events-none"
                            style={{ bottom: `${(currentGoal / maxVal) * 100}%` }}
                        >
                            <span className="absolute right-0 -top-5 text-[10px] font-bold text-slate-500 bg-white px-1">Doel: {currentGoal}</span>
                        </div>

                        {chartData.map((d, i) => {
                            const height = (d.value / maxVal) * 100;
                            const isOver = d.value > currentGoal;
                            // mapping colors dynamically for tailwind requires full class names usually or safelisting
                            // But usually simple interpolation like `bg-${color}-500` works if classes exist in bundle
                            // We used specific colors in array: blue, red, green, yellow.
                            // Let's use strict logic to be safe or just inline styles if uncertain, 
                            // but standard tailwind safelisting usually catches these if common.
                            // To be safe, let's map color to specific classes.

                            const getColorClass = (c, strong) => {
                                const map = {
                                    blue: strong ? 'bg-blue-500' : 'bg-blue-400',
                                    red: strong ? 'bg-red-500' : 'bg-red-400',
                                    green: strong ? 'bg-green-500' : 'bg-green-400',
                                    yellow: strong ? 'bg-yellow-500' : 'bg-yellow-400',
                                };
                                return map[c] || 'bg-slate-500';
                            }

                            const barColor = isOver ? 'bg-slate-800' : getColorClass(activeColor, true);

                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group relative z-10 h-full">
                                    <div className="w-full relative flex items-end justify-center flex-1 rounded-t-lg bg-slate-50 hover:bg-slate-100 transition overflow-hidden">
                                        <div
                                            className={`w-full max-w-[20px] rounded-t-lg transition-all duration-500 ${barColor}`}
                                            style={{ height: `${height}%` }}
                                        />

                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-slate-800 text-white text-xs py-1 px-2 rounded font-bold whitespace-nowrap z-20">
                                            {d.value} {metric === 'calories' ? 'kcal' : 'g'}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 truncate w-full text-center">{d.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Achievements Preview */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 mb-3">
                        <Award className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Prestaties</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {/* Placeholder Badges */}
                        <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center gap-1 opacity-100 border-2 border-yellow-200">
                            <div className="text-xl">🏆</div>
                            <span className="text-[8px] font-bold text-slate-800">Eerste Log</span>
                        </div>
                        <div className={`flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center gap-1 ${stats.streak >= 3 ? 'opacity-100 border-2 border-orange-200' : 'opacity-40 grayscale'}`}>
                            <div className="text-xl">🔥</div>
                            <span className="text-[8px] font-bold text-slate-800">3 Dagen</span>
                        </div>
                        <div className={`flex-shrink-0 w-16 h-16 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center gap-1 ${stats.streak >= 7 ? 'opacity-100 border-2 border-blue-200' : 'opacity-40 grayscale'}`}>
                            <div className="text-xl">🚀</div>
                            <span className="text-[8px] font-bold text-slate-800">7 Dagen</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
