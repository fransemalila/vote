'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const rules = [
  {
    key: 'whoCanVote',
    title: {
      en: 'Who can vote?',
      sw: 'Nani anaweza kupiga kura?'
    },
    content: {
      en: 'You must be a Tanzanian citizen, at least 18 years old, and registered with a valid National ID (NIDA) or voter card.',
      sw: 'Lazima uwe raia wa Tanzania, umri wa miaka 18 au zaidi, na uwe umejiandikisha na NIDA au kadi ya mpiga kura.'
    }
  },
  {
    key: 'idRequired',
    title: {
      en: 'What ID is required?',
      sw: 'Ni kitambulisho gani kinahitajika?'
    },
    content: {
      en: 'A valid National ID (NIDA) or voter card is required to vote.',
      sw: 'Unahitaji NIDA au kadi ya mpiga kura ili kupiga kura.'
    }
  },
  {
    key: 'howToVote',
    title: {
      en: 'How do I vote?',
      sw: 'Ninawezaje kupiga kura?'
    },
    content: {
      en: 'Go to your assigned polling station with your ID, get your ballot, mark your choice, and submit your vote in the box.',
      sw: 'Nenda kituo chako cha kupigia kura na kitambulisho, chukua karatasi ya kura, weka alama kwa chaguo lako, na tia kura kwenye sanduku.'
    }
  },
];

export default function RulesPage() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState<string | null>(null);
  const lang = i18n.language || 'en';

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('education.rules.title', 'Election Rules')}</h2>
        <div>
          <button onClick={() => i18n.changeLanguage('en')} className="mr-2">EN</button>
          <button onClick={() => i18n.changeLanguage('sw')}>SW</button>
        </div>
      </div>
      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.key} className="border rounded">
            <button
              className="w-full text-left p-4 font-semibold flex justify-between items-center focus:outline-none"
              aria-expanded={open === rule.key}
              aria-controls={`section-${rule.key}`}
              onClick={() => setOpen(open === rule.key ? null : rule.key)}
            >
              {rule.title[lang]}
              <span>{open === rule.key ? '-' : '+'}</span>
            </button>
            {open === rule.key && (
              <div id={`section-${rule.key}`} className="p-4 border-t bg-gray-50" role="region">
                {rule.content[lang]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 