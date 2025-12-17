import React from 'react';
import { Trash2, CheckCircle, ShoppingBasket } from 'lucide-react';
import { putSetting } from '../db';

export default function ListTab({ shoppingListItems, setShoppingListItems, onSwitchToFood }) {

    const clearList = () => {
        setShoppingListItems([]);
        putSetting('shoppingList', []);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <div className="px-1 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Boodschappen</h1>
                    <p className="text-slate-500">Jouw lijstje.</p>
                </div>
                {shoppingListItems.length > 0 && (
                    <button onClick={clearList} className="text-red-500 text-xs font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full">
                        <Trash2 className="w-3 h-3" /> Wis alles
                    </button>
                )}
            </div>

            {shoppingListItems.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {shoppingListItems.map((item, idx) => (
                        <div key={idx} className="p-4 border-b border-slate-50 flex items-center gap-3 last:border-0">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-slate-700">{item}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                    <ShoppingBasket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Je lijstje is leeg.</p>
                    <button onClick={onSwitchToFood} className="mt-4 text-blue-600 font-bold text-sm hover:underline">
                        Bekijk recepten
                    </button>
                </div>
            )}

            <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Standaard Voorraad</h3>
                <div className="grid grid-cols-1 gap-3">
                    {["Volkoren Pasta & Rijst", "Havermout & Wraps", "Noten & Pindakaas", "Diepvriesfruit & Groente"].map((item, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-300" /> {item}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
