import React from 'react';
import { Info } from 'lucide-react';

export default function CircuitTab({ exercises }) {
    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <div className="px-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Kracht Circuit</h1>
                <p className="text-slate-500">3 rondes. 90 sec rust tussen rondes.</p>
            </div>

            <div className="space-y-3">
                {exercises.map((ex) => (
                    <div key={ex.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-xl flex items-center justify-center shrink-0">
                            {ex.id}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">{ex.title}</h4>
                            <p className="text-xs text-slate-500">{ex.desc}</p>
                        </div>
                        <div className="ml-auto bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                            {ex.reps}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3">
                <Info className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-sm text-orange-800">
                    <strong>Tip:</strong> Focus op vorm, niet op snelheid. Als het te makkelijk is, pak de band korter vast.
                </p>
            </div>
        </div>
    );
}
