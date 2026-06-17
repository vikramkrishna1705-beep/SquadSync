import React, { useState } from 'react';
import { Label } from '@/types';
import { X, Plus, Tag } from 'lucide-react';

const COLORS = [
    { value: 'red', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', colorClass: 'bg-red-500' },
    { value: 'blue', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', colorClass: 'bg-blue-500' },
    { value: 'green', bg: 'bg-[#00FF87]/10', text: 'text-[#00FF87]', border: 'border-[#00FF87]/20', colorClass: 'bg-[#00FF87]' },
    { value: 'yellow', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', colorClass: 'bg-yellow-500' },
    { value: 'purple', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', colorClass: 'bg-purple-500' },
    { value: 'pink', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', colorClass: 'bg-pink-500' }
];

interface LabelPickerProps {
    labels: Label[];
    onChange: (labels: Label[]) => void;
}

export default function LabelPicker({ labels = [], onChange }: LabelPickerProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [newName, setNewName] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].value);

    const handleAdd = () => {
        if (!newName.trim()) return;
        const updated = [...labels, { name: newName.trim(), color: selectedColor }];
        onChange(updated);
        setNewName('');
        setIsOpen(false);
    };

    const handleRemove = (indexToRemove: number) => {
        const updated = labels.filter((_, i) => i !== indexToRemove);
        onChange(updated);
    };

    return (
        <div className="flex flex-col gap-2 relative w-full">
            <div className="flex flex-wrap items-center gap-2">
                {labels.map((label: Label, i: number) => {
                    const colorData = COLORS.find((c: { value: string, bg: string, text: string, border: string, colorClass: string }) => c.value === label.color) || COLORS[0];
                    return (
                        <span 
                            key={label.name} 
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${colorData.bg} ${colorData.text} ${colorData.border}`}
                        >
                            {label.name}
                            <button 
                                type="button" 
                                onClick={(e) => { e.preventDefault(); handleRemove(i); }} 
                                className="hover:text-white transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    );
                })}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-dashed border-[#222222] text-[#888888] hover:border-[#00FF87] hover:text-[#00FF87] transition-colors"
                >
                    <Plus size={12} /> Add Label
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-20 w-64 bg-[#111111] border border-[#222222] shadow-xl rounded-md p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-white text-sm font-bold uppercase tracking-widest mb-1">
                        <Tag size={14} className="text-[#00FF87]" /> New Label
                    </div>
                    
                    <input
                        type="text"
                        placeholder="Label name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAdd();
                            }
                        }}
                        className="bg-[#1a1a1a] border border-[#222222] text-sm rounded-md focus:border-[#00FF87] block w-full p-2 outline-none text-white transition-colors"
                    />

                    <div className="flex gap-2 justify-between">
                        {COLORS.map((c: { value: string, bg: string, text: string, border: string, colorClass: string }) => (
                            <button
                                key={c.value}
                                type="button"
                                onClick={() => setSelectedColor(c.value)}
                                className={`w-6 h-6 rounded-full transition-transform ${c.colorClass} ${selectedColor === c.value ? 'ring-2 ring-offset-2 ring-offset-[#111111] ring-white scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={!newName.trim()}
                        className="w-full mt-2 bg-[#00FF87] text-black font-black py-1.5 rounded-md hover:bg-[#00cc6a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm uppercase tracking-widest"
                    >
                        Add
                    </button>
                </div>
            )}
            
            {/* Click outside backdrop for picker */}
            {isOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            )}
        </div>
    );
}
