import { useTranslation } from 'react-i18next';
import { setLanguage } from '../../../lib/i18n';

/**
 * EN / 中文 language toggle. Persists the choice to localStorage and switches
 * the whole UI live via react-i18next.
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'zh' ? 'zh' : 'en';

  const btn = (active: boolean) =>
    `px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
      active ? 'bg-[#4B3EEF] text-white shadow' : 'text-gray-600 hover:text-[#4B3EEF]'
    }`;

  return (
    <div className="flex items-center rounded-xl border border-indigo-200/50 bg-white/80 backdrop-blur-sm p-0.5">
      <button type="button" onClick={() => setLanguage('en')} className={btn(lang === 'en')}>
        EN
      </button>
      <button type="button" onClick={() => setLanguage('zh')} className={btn(lang === 'zh')}>
        中文
      </button>
    </div>
  );
}
