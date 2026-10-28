import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, Compass, Check, ArrowRight } from 'lucide-react';

export const SensoryQuizModal: React.FC = () => {
  const { isQuizOpen, setIsQuizOpen, addToCart, products, triggerConfetti } = useApp();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    flavor: 'resin',
    time: 'dusk',
    effect: 'focus',
  });
  const [completed, setCompleted] = useState(false);

  if (!isQuizOpen) return null;

  const handleFinish = () => {
    setCompleted(true);
    triggerConfetti();
  };

  const recommendedProduct = products[0] || {
    id: 'preview-drink',
    name: 'Nordic Botanical Tonic',
    price: 14.50,
    size: '330 ml',
    category: 'ADAPTOGENIC TONIC',
    description: 'Artisanal Nordic botanical drink',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => setIsQuizOpen(false)}
        className="fixed inset-0 bg-[#0E1D14]/70 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-sm bg-[#FBF9F5] rounded-3xl p-6 shadow-2xl border border-[#E8E2D3] z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsQuizOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#EFECE2] flex items-center justify-center text-[#405445]"
        >
          <X className="w-4 h-4" />
        </button>

        {!completed ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase">
                SENSORY LAB • STEP {step} OF 3
              </span>
            </div>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B] mb-2">
              {step === 1 && 'What forest aroma draws you in?'}
              {step === 2 && 'When do you seek your ritual?'}
              {step === 3 && 'What botanical effect do you crave?'}
            </h3>
            <p className="text-xs text-[#637568] mb-5">
              Our master herbalist calculates your optimal Nordic flavor balance.
            </p>

            {step === 1 && (
              <div className="space-y-2.5 mb-6">
                {[
                  { id: 'resin', title: '🌲 Boreal Pine & Evergreen', sub: 'Crisp needle resins, morning dew' },
                  { id: 'berry', title: '🫐 Wild Subarctic Berry', sub: 'Tart lingonberry, golden cloudberry' },
                  { id: 'smoke', title: '🪵 Smoked Birch Bark & Peat', sub: 'Wood smoke, sweet birch sap' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers(prev => ({ ...prev, flavor: opt.id }))}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.flavor === opt.id
                        ? 'border-[#183324] bg-[#183324] text-white'
                        : 'border-[#E6E0D2] bg-white text-[#1C3123] hover:border-[#CFBFA7]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{opt.title}</div>
                      <div className={`text-[11px] ${answers.flavor === opt.id ? 'text-[#E5A953]' : 'text-[#7D8F82]'}`}>
                        {opt.sub}
                      </div>
                    </div>
                    {answers.flavor === opt.id && <Check className="w-4 h-4 text-[#E5A953]" />}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2.5 mb-6">
                {[
                  { id: 'morning', title: '🌅 Nordic Dawn Ritual', sub: 'Crisp energy before sunrise' },
                  { id: 'dusk', title: '🌆 Solstice Dusk Unwind', sub: 'Golden hour botanical aperitif' },
                  { id: 'night', title: '🌌 Midnight Sun Elixir', sub: 'Deep relaxation without alcohol' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers(prev => ({ ...prev, time: opt.id }))}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.time === opt.id
                        ? 'border-[#183324] bg-[#183324] text-white'
                        : 'border-[#E6E0D2] bg-white text-[#1C3123] hover:border-[#CFBFA7]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{opt.title}</div>
                      <div className={`text-[11px] ${answers.time === opt.id ? 'text-[#E5A953]' : 'text-[#7D8F82]'}`}>
                        {opt.sub}
                      </div>
                    </div>
                    {answers.time === opt.id && <Check className="w-4 h-4 text-[#E5A953]" />}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-2.5 mb-6">
                {[
                  { id: 'focus', title: '⚡ Mental Clarity & Focus', sub: 'Wild chaga & invigorating spruce' },
                  { id: 'calm', title: '🕊️ Deep Nervous System Rest', sub: 'Angelica root & chamomile' },
                  { id: 'social', title: '🥂 Elevated Zero-Proof Euphoria', sub: 'Complex tannins & effervescence' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setAnswers(prev => ({ ...prev, effect: opt.id }))}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      answers.effect === opt.id
                        ? 'border-[#183324] bg-[#183324] text-white'
                        : 'border-[#E6E0D2] bg-white text-[#1C3123] hover:border-[#CFBFA7]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{opt.title}</div>
                      <div className={`text-[11px] ${answers.effect === opt.id ? 'text-[#E5A953]' : 'text-[#7D8F82]'}`}>
                        {opt.sub}
                      </div>
                    </div>
                    {answers.effect === opt.id && <Check className="w-4 h-4 text-[#E5A953]" />}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-xs text-[#6C7E71] font-semibold hover:underline"
                >
                  Back
                </button>
              ) : <div />}

              <button
                onClick={() => {
                  if (step < 3) setStep(s => s + 1);
                  else handleFinish();
                }}
                className="px-5 py-2.5 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-[#234330]"
              >
                <span>{step === 3 ? 'Reveal My Profile' : 'Next Question'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-full bg-[#183324] text-[#E5A953] flex items-center justify-center mx-auto mb-3 shadow-md">
              <Compass className="w-7 h-7" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-[#937548] uppercase">
              YOUR BOTANICAL ARCHETYPE
            </span>
            <h3 className="font-editorial text-2xl font-medium text-[#14261B] mt-1 mb-2">
              Taiga Forager & Pine Alchemist
            </h3>
            <p className="text-xs text-[#5D6E62] leading-relaxed mb-4">
              Your palette prefers resinous spruce needles, mineral acidity, and invigorating adaptogenic wild chaga.
            </p>

            <div className="bg-white rounded-2xl p-3 border border-[#E7E1D4] text-left flex items-center gap-3 mb-5 shadow-soft-sm">
              <img
                src={recommendedProduct.imageUrl}
                alt={recommendedProduct.name}
                className="w-14 h-14 rounded-xl object-cover border border-[#E7E2D6]"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-[#E5A953] tracking-wide">98% COMPATIBLE</span>
                <h4 className="font-editorial text-sm font-semibold text-[#183122] truncate">
                  {recommendedProduct.name}
                </h4>
                <p className="text-xs font-bold text-[#14261B]">€{recommendedProduct.price.toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  addToCart(recommendedProduct);
                  setIsQuizOpen(false);
                }}
                className="w-full py-3 bg-[#183324] text-[#FAF8F3] text-xs font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-[#234330]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E5A953]" />
                Add Matched Blend to Box
              </button>
              <button
                onClick={() => setIsQuizOpen(false)}
                className="w-full py-2 text-xs text-[#6C7E71] font-semibold hover:underline"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
