import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'mr', name: 'मराठी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="flex items-center space-x-2 text-slate-300">
      <Globe size={18} className="text-emerald-500" />
      <select
        value={i18n.language}
        onChange={changeLanguage}
        className="bg-slate-800 border border-slate-700 text-sm rounded focus:ring-emerald-500 focus:border-emerald-500 block p-1.5 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
      >
        {languages.map((lng) => (
          <option key={lng.code} value={lng.code}>
            {lng.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
