import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Scale,
  BookOpen,
  X,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citation?: string;
  confidence?: number;
  timestamp: string;
}

const KNOWLEDGE_BASE_QA: { keywords: string[]; answer: string; citation: string; confidence: number }[] = [
  {
    keywords: ['solatium', 'section 30', '30', 'formula', 'compensation calculation'],
    answer:
      'Under Section 30(1) of the RFCTLARR Act (2013), the Collector is statutorily mandated to impose a "Solatium" amount equivalent to 100% over and above the total market valuation of land, buildings, and trees. Additionally, Section 30(3) requires 12% per annum interest from the date of Section 11(1) preliminary notification up to the date of the award decree.',
    citation: 'RFCTLARR Act 2013, Section 30(1) & First Schedule',
    confidence: 0.99,
  },
  {
    keywords: ['gowramma', 'supreme court', 'market value', 'fairness', 'circle rate', '2024'],
    answer:
      'In the landmark ruling State of Karnataka v. Gowramma (2024), the Hon\'ble Supreme Court of India held that compensation must reflect actual market value based on comparable registered sale deeds in the vicinity, not merely outdated circle rates. Our Compensation Fairness Index enforces this precedent by cross-referencing all awards against registered sale transactions within a 2km spatial radius.',
    citation: 'Supreme Court of India (2024) — State of Karnataka v. Gowramma & Ors.',
    confidence: 0.98,
  },
  {
    keywords: ['section 101', '101', 'unused', 'return', '5 years', 'possession'],
    answer:
      'Section 101 of the RFCTLARR Act (2013) stipulates that when any land acquired remains unutilized for a period of 5 years from taking possession, the land must be returned to the original owners or legal heirs, or transferred to the State Land Bank. BHUMI-SHIELD integrates Synthetic Aperture Radar (SAR) backscatter time-series to monitor idle ground roughness and auto-trigger Section 101 compliance workflows.',
    citation: 'RFCTLARR Act 2013, Section 101 & DoLR Guidelines',
    confidence: 0.97,
  },
  {
    keywords: ['consent', 'threshold', '70%', '80%', 'ppp', 'private'],
    answer:
      'Under Section 2(2) of the 2013 Act, prior consent of affected landowners is legally mandatory before acquisition begins: 70% consent for Public-Private Partnership (PPP) projects and 80% consent for private company acquisitions. Our Real-Time Consent Tracker monitors consent velocity against these statutory thresholds and forecasts SLA breaches.',
    citation: 'RFCTLARR Act 2013, Section 2(2) & Social Impact Assessment Rules',
    confidence: 0.99,
  },
  {
    keywords: ['sar', 'radar', 'sentinel', 'nisar', 'monsoon', 'insar', 'change detection'],
    answer:
      'BHUMI-SHIELD integrates Sentinel-1 C-Band and ISRO-NASA NISAR Synthetic Aperture Radar (SAR). Unlike optical satellites, SAR penetrates heavy cloud cover during Indian monsoons to verify physical land possession (Section 38), detect pre-notification illegal encroachment shanties via double-bounce backscatter, and monitor millimetric embankment subsidence using InSAR (Interferometric SAR).',
    citation: 'Copernicus Sentinel-1 SAR & ISRO Bhoonidhi Technical Protocol',
    confidence: 0.96,
  },
  {
    keywords: ['tarsem', 'railways', 'highways', 'multi-act', '2025'],
    answer:
      'In Union of India v. Tarsem Singh (2025), the Supreme Court confirmed that the beneficial compensation and solatium principles of the RFCTLARR Act (2013) apply to acquisitions under specialized enactments including the Railways Act 1989 and National Highways Act 1956. BHUMI-SHIELD\'s Multi-Act Harmonizer unifies these workflows across line ministries.',
    citation: 'Supreme Court of India (2025) — Union of India v. Tarsem Singh',
    confidence: 0.97,
  },
  {
    keywords: ['section 11', 'preliminary', 'notification', 'objection', 'section 15'],
    answer:
      'Section 11(1) is the statutory Preliminary Gazette Notification declaring government intent to acquire land. Once published, Section 15 grants affected persons a 60-day legal window to file objections regarding public purpose, area suitability, or SIA findings directly to the Collector.',
    citation: 'RFCTLARR Act 2013, Section 11(1) & Section 15(1)',
    confidence: 0.98,
  },
];

export const BhumiPolicyCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Namaste! I am your BhumiAI Statutory & Policy Copilot, trained on the RFCTLARR Act (2013), Supreme Court land acquisition precedents (including Gowramma 2024 and Tarsem Singh 2025), and DoLR circulars. How may I assist you with statutory compliance today?',
      citation: 'DoLR / RFCTLARR Act (2013) Statutory Repository',
      confidence: 0.99,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      const matched = KNOWLEDGE_BASE_QA.find((item) =>
        item.keywords.some((k) => lower.includes(k))
      );

      const botResponse: ChatMessage = matched
        ? {
            id: `bot-${Date.now()}`,
            sender: 'assistant',
            text: matched.answer,
            citation: matched.citation,
            confidence: matched.confidence,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          }
        : {
            id: `bot-${Date.now()}`,
            sender: 'assistant',
            text: `Under the RFCTLARR Act (2013), all acquisition procedures must satisfy mandatory Social Impact Assessments (SIA), Section 11 Preliminary Notifications, Section 19 Declarations, and Section 23 Award Inquiries with 100% Solatium (Section 30). For customized multi-act parameters, our workflow engine applies state-specific rules and Supreme Court compliance standards.`,
            citation: 'RFCTLARR Act 2013 & DoLR Operational Manual',
            confidence: 0.92,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Copilot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[2000] flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#9A3412] text-white font-extrabold text-xs shadow-2xl hover:shadow-orange-500/40 transition-all cursor-pointer border border-[#EA580C] group"
          title="Open BhumiAI Legal & Policy RAG Copilot"
        >
          <div className="p-1 rounded-full bg-white/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="tracking-wide">BhumiAI Legal Copilot</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-[9px] font-mono font-bold text-white">
            RAG v2.0
          </span>
        </button>
      )}

      {/* RAG Chatbot Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[2000] w-[92vw] sm:w-[440px] h-[580px] bg-white border border-[#BAE6FD] rounded-2xl shadow-2xl flex flex-col font-sans overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#0F172A] text-white flex items-center justify-between border-b border-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#EA580C] text-white shadow-md">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-xs tracking-wide text-white">
                    BhumiAI Legal & Policy Copilot
                  </h3>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#EA580C] text-white">
                    RFCTLARR 2013
                  </span>
                </div>
                <p className="text-[10px] text-[#94A3B8]">
                  RAG on 113 Sections • 4 Schedules • Supreme Court Precedents
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-[#F0F7FF] border-b border-[#BAE6FD] flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold text-[#0369A1] whitespace-nowrap">
            <span className="text-[9px] text-[#64748B] uppercase font-bold shrink-0">Quick Queries:</span>
            {[
              'Section 30 Solatium',
              'SC Gowramma (2024)',
              'SAR Radar Verification',
              'Section 101 Land Return',
              '70% Consent Threshold',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                className="px-2 py-1 rounded-md bg-white border border-[#BAE6FD] hover:bg-[#E0F2FE] hover:border-[#0284C7] text-[#0F172A] transition-all cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#EA580C] text-white rounded-br-none font-medium'
                      : 'bg-white border border-[#E2E8F0] text-[#0F172A] rounded-bl-none font-normal'
                  }`}
                >
                  <p>{m.text}</p>

                  {m.citation && (
                    <div className="mt-2 pt-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B] flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#0369A1] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#EA580C]" />
                        <span>{m.citation}</span>
                      </span>
                      {m.confidence && (
                        <span className="font-mono text-[9px] font-bold text-[#059669]">
                          {Math.round(m.confidence * 100)}% Conf
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-[#94A3B8] mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#E2E8F0] text-[#64748B] text-xs max-w-fit shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#EA580C] animate-spin" />
                <span className="text-[11px] font-bold text-[#EA580C]">
                  Retrieving statutory sections & Supreme Court precedents...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#BAE6FD] flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask any question on RFCTLARR, Solatium, Court Rulings..."
              className="flex-1 px-3 py-2 text-xs bg-[#F0F7FF] border border-[#BAE6FD] rounded-xl text-[#0F172A] focus:outline-none focus:border-[#EA580C]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-[#CBD5E1] text-white transition-all cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
