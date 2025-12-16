import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X, Save, Edit2, Sparkles, Loader2 } from 'lucide-react';
import { getAll, put, deleteItem, getSetting, putSetting } from '../db';
import { calculateNutritionGoals } from '../ai';

export default function DataManagement({ isOpen, onClose, onDataChanged }) {
    const [activeTab, setActiveTab] = useState('recipes');
    const [items, setItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadItems();
        }
    }, [isOpen, activeTab]);

    const loadItems = async () => {
        if (activeTab === 'settings') {
            const apiKey = await getSetting('openai_api_key');
            const goal = await getSetting('calorie_goal');
            const height = await getSetting('user_height');
            const weight = await getSetting('user_weight');
            const protein = await getSetting('protein_goal');
            const carbs = await getSetting('carbs_goal');
            const fat = await getSetting('fat_goal');

            setEditingItem({
                openai_api_key: apiKey,
                calorie_goal: goal,
                user_height: height,
                user_weight: weight,
                protein_goal: protein,
                carbs_goal: carbs,
                fat_goal: fat
            });
            setIsAdding(true); // Re-use the form view
            return;
        }

        let storeName = activeTab;
        if (activeTab === 'schedule') storeName = 'events';
        const data = await getAll(storeName);
        setItems(data);
    };

    const handleDelete = async (key) => {
        if (confirm('Are you sure you want to delete this item?')) {
            let storeName = activeTab;
            if (activeTab === 'schedule') storeName = 'events';

            await deleteItem(storeName, key);
            await loadItems();
            if (onDataChanged) onDataChanged();
        }
    };

    const handleGenerateGoals = async () => {
        setIsGenerating(true);
        try {
            const apiKey = await getSetting('openai_api_key');
            const height = await getSetting('user_height');
            const weight = await getSetting('user_weight');
            const schedule = await getAll('events');

            if (!apiKey || !height || !weight) {
                alert("Vul eerst je API key, lengte en gewicht in en sla op.");
                return;
            }

            const goals = await calculateNutritionGoals({
                stats: { height, weight },
                schedule: schedule.filter(e => new Date(e.date) >= new Date())
            }, apiKey);

            setEditingItem(prev => ({
                ...prev,
                calorie_goal: goals.calories,
                protein_goal: goals.protein,
                carbs_goal: goals.carbs,
                fat_goal: goals.fat
            }));

        } catch (err) {
            alert("Genereren mislukt: " + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (activeTab === 'settings') {
            await putSetting('openai_api_key', data.openai_api_key);
            await putSetting('calorie_goal', data.calorie_goal);
            await putSetting('user_height', data.user_height);
            await putSetting('user_weight', data.user_weight);
            await putSetting('protein_goal', data.protein_goal);
            await putSetting('carbs_goal', data.carbs_goal);
            await putSetting('fat_goal', data.fat_goal);
            alert('Settings opgeslagen!');
            return;
        }

        let storeName = activeTab;
        if (activeTab === 'schedule') storeName = 'events';

        // Process specific fields based on type
        if (activeTab === 'recipes') {
            data.id = editingItem ? editingItem.id : Date.now();
            data.tags = data.tags.split(',').map(t => t.trim());
            data.ingredients = data.ingredients.split(',').map(i => i.trim());
        } else if (activeTab === 'schedule') {
            // Date is the key
        } else if (activeTab === 'exercises') {
            data.id = editingItem ? editingItem.id : Date.now();
        }

        try {
            await put(storeName, data);
            await loadItems();
            if (onDataChanged) onDataChanged();
            setEditingItem(null);
            setIsAdding(false);
        } catch (err) {
            alert('Error saving item: ' + err.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
            <div className="bg-slate-50 w-full max-w-2xl mx-auto rounded-2xl shadow-2xl pointer-events-auto max-h-[90vh] flex flex-col m-4 relative z-10">

                {/* Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center rounded-t-2xl">
                    <h2 className="font-bold text-xl text-slate-800">Gegevens Beheer</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white">
                    {['recipes', 'schedule', 'exercises', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setEditingItem(null); setIsAdding(false); }}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition ${activeTab === tab
                                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab === 'schedule' ? 'Kalender' : tab === 'recipes' ? 'Recepten' : tab === 'exercises' ? 'Circuit' : 'Instellingen'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">

                    {(isAdding || editingItem) ? (
                        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-lg mb-4">{editingItem ? 'Bewerk Item' : 'Nieuw Item'}</h3>

                            {activeTab === 'recipes' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titel</label>
                                        <input name="title" defaultValue={editingItem?.title} required className="w-full p-2 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tijd</label>
                                            <input name="time" defaultValue={editingItem?.time} placeholder="15 min" required className="w-full p-2 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tags (komma gescheiden)</label>
                                            <input name="tags" defaultValue={editingItem?.tags?.join(', ')} placeholder="Snel, Vega" required className="w-full p-2 border border-slate-200 rounded-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ingrediënten (komma gescheiden)</label>
                                        <textarea name="ingredients" defaultValue={editingItem?.ingredients?.join(', ')} required className="w-full p-2 border border-slate-200 rounded-lg h-20" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Instructies</label>
                                        <textarea name="instructions" defaultValue={editingItem?.instructions} required className="w-full p-2 border border-slate-200 rounded-lg h-32" />
                                    </div>
                                </>
                            )}

                            {activeTab === 'schedule' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Datum (YYYY-MM-DD)</label>
                                        <input name="date" defaultValue={editingItem?.date} readOnly={!!editingItem} required className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titel</label>
                                        <input name="title" defaultValue={editingItem?.title} required className="w-full p-2 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                            <select name="type" defaultValue={editingItem?.type || 'training'} className="w-full p-2 border border-slate-200 rounded-lg">
                                                <option value="training">Training</option>
                                                <option value="match">Wedstrijd</option>
                                                <option value="rest">Rust</option>
                                                <option value="active_rest">Actief Herstel</option>
                                                <option value="power">Power</option>
                                                <option value="strength">Kracht</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Icoon</label>
                                            <select name="icon" defaultValue={editingItem?.icon || 'volleyball'} className="w-full p-2 border border-slate-200 rounded-lg">
                                                <option value="volleyball">Volleybal</option>
                                                <option value="trophy">Beker</option>
                                                <option value="moon">Maan</option>
                                                <option value="coffee">Koffie</option>
                                                <option value="zap">Bliksem</option>
                                                <option value="dumbbell">Halter</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Details</label>
                                        <input name="details" defaultValue={editingItem?.details} required className="w-full p-2 border border-slate-200 rounded-lg" />
                                    </div>
                                </>
                            )}

                            {activeTab === 'exercises' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Titel</label>
                                        <input name="title" defaultValue={editingItem?.title} required className="w-full p-2 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reps / Tijd</label>
                                            <input name="reps" defaultValue={editingItem?.reps} required className="w-full p-2 border border-slate-200 rounded-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Omschrijving</label>
                                        <textarea name="desc" defaultValue={editingItem?.desc} required className="w-full p-2 border border-slate-200 rounded-lg h-24" />
                                    </div>
                                </>
                            )}

                            {activeTab === 'settings' && (
                                <>
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 text-sm text-yellow-800 mb-4">
                                        <p>Voor de AI Scanner heb je een OpenRouter Key nodig. Deze wordt lokaal opgeslagen.</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OpenRouter API Key</label>
                                        <input name="openai_api_key" type="password" defaultValue={editingItem?.openai_api_key} placeholder="sk-or-..." className="w-full p-2 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dagelijks Calorie Doel (kcal)</label>
                                        <input name="calorie_goal" type="number" defaultValue={editingItem?.calorie_goal || 2500} className="w-full p-2 border border-slate-200 rounded-lg" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lengte (cm)</label>
                                            <input name="user_height" type="number" defaultValue={editingItem?.user_height} placeholder="185" className="w-full p-2 border border-slate-200 rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gewicht (kg)</label>
                                            <input name="user_weight" type="number" defaultValue={editingItem?.user_weight} placeholder="80" className="w-full p-2 border border-slate-200 rounded-lg" />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-bold text-slate-800">Macro Doelen (AI)</h4>
                                            <button
                                                type="button"
                                                onClick={handleGenerateGoals}
                                                disabled={isGenerating}
                                                className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-full font-bold hover:bg-purple-100 transition flex items-center gap-1"
                                            >
                                                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                Genereer met AI
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Eiwit (g)</label>
                                                <input name="protein_goal" type="number" defaultValue={editingItem?.protein_goal} className="w-full p-2 border border-slate-200 rounded-lg" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Koolh (g)</label>
                                                <input name="carbs_goal" type="number" defaultValue={editingItem?.carbs_goal} className="w-full p-2 border border-slate-200 rounded-lg" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vet (g)</label>
                                                <input name="fat_goal" type="number" defaultValue={editingItem?.fat_goal} className="w-full p-2 border border-slate-200 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="flex-1 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition">Annuleren</button>
                                <button type="submit" className="flex-1 py-2 font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" /> Opslaan
                                </button>
                            </div>

                        </form>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsAdding(true)}
                                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Nieuw Item Toevoegen
                            </button>

                            {items.map((item, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition">
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-slate-800 truncate">{item.title || item.date}</h4>
                                        <p className="text-xs text-slate-500 truncate">{item.details || item.desc || item.time}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingItem(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(activeTab === 'schedule' ? item.date : item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {items.length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-10">Geen items gevonden.</p>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
