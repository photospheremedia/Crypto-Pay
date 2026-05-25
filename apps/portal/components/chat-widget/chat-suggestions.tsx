"use client";

const SUGGESTIONS = [
  "How does delivery integration work?",
  "Tell me about the supply marketplace",
  "What technology services do you offer?",
  "How can I get started?",
];

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
        Quick questions:
      </p>
      <div className="flex flex-col gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSelect(suggestion)}
            className="text-left px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-emerald-400 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
