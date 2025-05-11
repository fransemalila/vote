'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const faqs = [
  {
    key: 'register',
    question: {
      en: 'How do I register to vote?',
      sw: 'Ninawezaje kujiandikisha kupiga kura?'
    },
    answer: {
      en: 'You can register at your local government office or online through the official voter registration portal.',
      sw: 'Unaweza kujiandikisha katika ofisi ya serikali ya mtaa au mtandaoni kupitia tovuti rasmi ya usajili wa wapiga kura.'
    }
  },
  {
    key: 'anonymous',
    question: {
      en: 'Is my vote anonymous?',
      sw: 'Je, kura yangu ni ya siri?'
    },
    answer: {
      en: 'Yes, all votes are cast in secret and your choices are confidential.',
      sw: 'Ndiyo, kura zote zinapigwa kwa siri na chaguo lako ni la faragha.'
    }
  },
  {
    key: 'whenVote',
    question: {
      en: 'When can I vote?',
      sw: 'Ninaweza kupiga kura lini?'
    },
    answer: {
      en: 'You can vote on election day during the official polling hours as announced by the electoral commission.',
      sw: 'Unaweza kupiga kura siku ya uchaguzi wakati wa saa rasmi zilizotangazwa na tume ya uchaguzi.'
    }
  },
];

export default function FaqPage() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState<string | null>(null);
  const lang = (i18n.language as 'en' | 'sw') || 'en';

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('education.faq.title', 'Frequently Asked Questions')}</h2>
        <div>
          <button onClick={() => i18n.changeLanguage('en')} className="mr-2">EN</button>
          <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
        </div>
      </div>
      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.key} className="border rounded">
            <button
              className="w-full text-left p-4 font-semibold flex justify-between items-center focus:outline-none"
              aria-expanded={open === faq.key}
              aria-controls={`faq-${faq.key}`}
              onClick={() => setOpen(open === faq.key ? null : faq.key)}
            >
              {faq.question[lang]}
              <span>{open === faq.key ? '-' : '+'}</span>
            </button>
            {open === faq.key && (
              <div id={`faq-${faq.key}`} className="p-4 border-t bg-gray-50" role="region">
                {faq.answer[lang]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 