import React from 'react';
import { ChevronRight, Settings, Calendar } from 'lucide-react';

export default function Header({
    currentDate,
    setCurrentDate,
    userStats,
    setShowAdminModal
}) {
    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
        <div className="flex justify-between items-end px-6 pt-6 pb-2 bg-white sticky top-0 z-40">
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
    );
}
