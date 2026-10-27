import React, { useState } from 'react';
import { X, HelpCircle, ChevronDown, Mail, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SupportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  q: string;
  a: string;
}

export const SupportDrawer: React.FC<SupportDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { setIsChatbotOpen, showToast } = useApp();

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs: FAQItem[] = [
    {
      q: 'Where do you deliver in Finland and Europe?',
      a: 'We deliver via carbon-neutral Posti Eco across all of Finland (home delivery and SmartPost parcel lockers), and chilled express to Sweden, Estonia, and select European hubs.',
    },
    {
      q: 'Can I customize or skip my monthly harvest drop?',
      a: 'Yes! Under your Active Subscription on this profile page, you can freely edit your 4 included cans, skip the upcoming month, or pause deliveries anytime before the dispatch date.',
    },
    {
      q: 'How does the Finnish bottle deposit (Pantti) work?',
      a: 'All Tellervo glass bottles and sleek aluminum cans carry the official Finnish PALPA recycling refund (€0.15–€0.40), redeemable at reverse vending machines across Finland.',
    },
    {
      q: 'What makes Tellervo botanical elixirs 0.0% ABV?',
      a: 'Our master distillers in Oulu use traditional copper pot hydro-distillation and cold botanical maceration with wild Lapland botanicals without alcohol fermentation.',
    },
  ];

  const handleLaunchSommelier = () => {
    onClose();
    setIsChatbotOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0F1E15]/60 backdrop-blur-sm"
      />

      {/* Slide-in Drawer */}
      <div className="relative w-full max-w-md bg-[#FBF9F5] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#EBE6DC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#183324] text-[#E5A953] flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-medium text-[#14261B]">Forest Concierge</h2>
              <p className="text-[11px] text-[#7A8A7D]">Customer assistance & foraging guides</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F0E6] flex items-center justify-center text-[#3D5244] hover:bg-[#EAE5D9]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Sommelier AI Highlight Card */}
          <div className="bg-gradient-to-br from-[#183324] to-[#254632] text-white rounded-2xl p-4 shadow-soft-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1 text-[#E5A953] text-[10px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Sommelier Assistant</span>
              </div>
              <h4 className="font-editorial text-lg font-medium text-white">
                Personalized Botanical Consultations
              </h4>
              <p className="text-xs text-[#B7D2BF] mt-1 leading-relaxed">
                Chat in real-time with our botanical Sommelier for flavor pairings, adaptogenic benefits, and mocktail recipes.
              </p>
              <button
                type="button"
                onClick={handleLaunchSommelier}
                className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#E5A953] text-[#14261B] text-xs font-bold hover:bg-[#F3BD6B] active:scale-95 transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Sommelier AI</span>
              </button>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A7851] mb-2.5">
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="bg-white rounded-2xl border border-[#E8E2D5] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-2 hover:bg-[#FAF8F3] transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14261B] leading-snug">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#718274] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#183324]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-0.5 text-xs text-[#5D6F61] leading-relaxed border-t border-[#F2ECE1]">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Concierge Contact Card */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E2D5] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#183324]">
              Helsinki Forest Concierge
            </h3>
            <p className="text-xs text-[#5D6F61]">
              Our dispatch team in Helsinki is available weekdays 09:00 - 17:00 EET for order inquiries and special requests.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText('info@tellervo.fi');
                  showToast('Copied email: info@tellervo.fi', 'info');
                }}
                className="p-2.5 rounded-xl bg-[#F5F2EB] hover:bg-[#ECE6DA] border border-[#E4DDD0] text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#183324]">
                  <Mail className="w-3.5 h-3.5 text-[#E5A953]" />
                  <span>Email Us</span>
                </div>
                <span className="text-[10px] text-[#718274] block mt-0.5">info@tellervo.fi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText('+358 40 123 4567');
                  showToast('Copied phone: +358 40 123 4567', 'info');
                }}
                className="p-2.5 rounded-xl bg-[#F5F2EB] hover:bg-[#ECE6DA] border border-[#E4DDD0] text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#183324]">
                  <Phone className="w-3.5 h-3.5 text-[#E5A953]" />
                  <span>Call Us</span>
                </div>
                <span className="text-[10px] text-[#718274] block mt-0.5">+358 40 123 4567</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#EAE4D7] text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-[#183324] text-white text-xs font-semibold rounded-xl hover:bg-[#254632] transition-colors"
          >
            Close Support
          </button>
        </div>
      </div>
    </div>
  );
};
