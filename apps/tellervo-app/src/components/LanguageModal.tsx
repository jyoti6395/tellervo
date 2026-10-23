import React from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../i18n/translations';
import { Language } from '../types';
import { X, Check, Globe } from 'lucide-react';

export const LanguageModal: React.FC = () => {
  const { language, setLanguage, isLanguageModalOpen, setIsLanguageModalOpen, t } = useApp();

  if (!isLanguageModalOpen) return null;

  const handleSelect = (langCode: Language) => {
    setLanguage(langCode);
    setIsLanguageModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsLanguageModalOpen(false)}
    >
      <div
        className="w-full max-w-md bg-stone-900 border border-emerald-900/60 rounded-3xl p-6 shadow-2xl relative text-stone-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative subtle forest glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-100 tracking-tight">
                {t.header.switchLanguage || 'Language'}
              </h3>
              <p className="text-xs text-stone-400">
                English • Suomi • Español
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLanguageModalOpen(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Options */}
        <div className="mt-4 space-y-2.5 relative z-10">
          {LANGUAGES.map((item) => {
            const isSelected = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 text-left active:scale-[0.99] ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-600/80 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                    : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl leading-none" role="img" aria-label={item.name}>
                    {item.flag}
                  </span>
                  <div>
                    <div className="font-medium text-stone-100 text-sm flex items-center gap-2">
                      <span>{item.nativeName}</span>
                      <span className="text-xs text-stone-400 font-mono uppercase bg-stone-800/80 px-1.5 py-0.5 rounded">
                        {item.code}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400">{item.name}</div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-stone-950 shadow-sm'
                      : 'border border-stone-700 bg-stone-800/40 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="mt-5 pt-3.5 border-t border-stone-800/80 text-center relative z-10">
          <p className="text-[11px] text-stone-400">
            Tellervo subarctic botanicals are crafted in Helsinki, Finland.
          </p>
        </div>
      </div>
    </div>
  );
};
