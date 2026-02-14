'use client';

import { DISCIPLINE_LIST } from '@/lib/disciplines';

interface DisciplineSelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

export default function DisciplineSelector({ selected, onChange }: DisciplineSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-zinc-300 mb-3">
        Discipline
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DISCIPLINE_LIST.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onChange(d.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all duration-200 ${
              selected === d.id
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-300'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
            }`}
          >
            <span className="text-lg flex-shrink-0">{d.icon}</span>
            <span className="font-medium truncate">{d.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
