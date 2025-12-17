import React from 'react';
import {
    Calendar, Settings, ChevronRight, Droplets, Apple, Carrot, Beef,
    Utensils, Zap, Trophy, ArrowRight, Dices
} from 'lucide-react';
import { putSetting } from '../db';

// --- DATA & LOGIC TO BE MOVED OR PASSED AS PROPS ---
/* 
   Ideally, Month/Day logic should be in a hook or separate utility to keep this clean.
   For now, we'll accept `plan` and `currentDate` as props.
*/

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

const WeekStrip = ({ currentDate, onSelectDate }) => {
    const days = [];
    const today = new Date();
    // 7 days window: Today - 2 to Today + 4
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

export default function HomeTab({
    currentDate,
    setCurrentDate,
    userStats,
    plan,
    theme,
    habits,
    setHabits,
    setShowAdminModal,
    setShowTrainingModal,
    setActiveTab,
    getIcon
}) {
    const isToday = currentDate.toDateString() === new Date().toDateString();

    const toggleHabit = (key) => {
        setHabits(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            putSetting('habits', newState);
            return newState;
        });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">

            <h1 className="text-3xl font-bold text-slate-900 px-6 pt-2">Hoi, Hidde 👋</h1>

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

                    <div className="flex flex-wrap gap-2 mt-4">
                        {plan.type === 'strength' && (
                            <button
                                onClick={() => setActiveTab('circuit')}
                                className="bg-white text-orange-600 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-orange-50 transition flex items-center gap-2"
                            >
                                Start Circuit <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                        {plan.type === 'match' || plan.type === 'training' || plan.type === 'strength' && (
                            <button
                                onClick={() => setShowTrainingModal(true)}
                                className="bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 backdrop-blur-sm border border-white/20"
                            >
                                Log Resultaat <Trophy className="w-4 h-4" />
                            </button>
                        )}
                    </div>
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
}
