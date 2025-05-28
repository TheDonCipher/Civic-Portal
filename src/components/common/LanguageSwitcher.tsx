// src/components/common/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'ghost',
  size = 'default',
  className = '',
  showLabel = false,
}) => {
  const { i18n, t } = useTranslation('ui');

  const handleLanguageChange = (languageCode: 'en' | 'tn') => {
    i18n.changeLanguage(languageCode);
  };

  const getCurrentLanguageLabel = () => {
    return i18n.resolvedLanguage === 'tn' ? t('language.setswana') : t('language.english');
  };

  const getCurrentLanguageIcon = () => {
    return i18n.resolvedLanguage === 'tn' ? '🇧🇼' : '🇬🇧';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`transition-all duration-200 hover:scale-105 ${className}`}
          aria-label={`Current language: ${getCurrentLanguageLabel()}. Click to change language.`}
        >
          <div className="flex items-center gap-2">
            {size === 'icon' ? (
              <Languages className="h-4 w-4" />
            ) : (
              <>
                <span className="text-base">{getCurrentLanguageIcon()}</span>
                {showLabel && (
                  <span className="hidden sm:inline-block">
                    {getCurrentLanguageLabel()}
                  </span>
                )}
                <Languages className="h-4 w-4" />
              </>
            )}
          </div>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 shadow-xl"
      >
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
            i18n.resolvedLanguage === 'en'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
              : ''
          }`}
          disabled={i18n.resolvedLanguage === 'en'}
        >
          <span className="text-base">🇬🇧</span>
          <span className="font-medium">{t('language.english')}</span>
          {i18n.resolvedLanguage === 'en' && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('tn')}
          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
            i18n.resolvedLanguage === 'tn'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
              : ''
          }`}
          disabled={i18n.resolvedLanguage === 'tn'}
        >
          <span className="text-base">🇧🇼</span>
          <span className="font-medium">{t('language.setswana')}</span>
          {i18n.resolvedLanguage === 'tn' && (
            <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
