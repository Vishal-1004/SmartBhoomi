import React from 'react';
import { Button } from './ui/button';
import { useLanguage } from './LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-md rounded-full p-1">
      <Button
        size="sm"
        variant={language === 'en' ? 'default' : 'ghost'}
        className={`h-8 px-3 text-xs rounded-full font-medium transition-all duration-200 ${
          language === 'en' 
            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button
        size="sm"
        variant={language === 'hi' ? 'default' : 'ghost'}
        className={`h-8 px-3 text-xs rounded-full font-medium transition-all duration-200 ${
          language === 'hi' 
            ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
        onClick={() => setLanguage('hi')}
      >
        हि
      </Button>
    </div>
  );
}