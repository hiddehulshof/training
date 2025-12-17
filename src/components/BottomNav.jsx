import React from 'react';
import { Home, ChefHat, Activity, List } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'food', icon: ChefHat, label: 'Voeding' },
        { id: 'circuit', icon: Activity, label: 'Circuit' },
        { id: 'list', icon: List, label: 'Lijst' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-50">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium mt-1">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
