import { useSettingsStore } from '../store/settingsStore';
import { useTranslation } from 'react-i18next';

export function SettingsPage(): React.JSX.Element {
  const { i18n } = useTranslation();
  const darkMode = useSettingsStore((state) => state.darkMode);
  const setDarkMode = useSettingsStore((state) => state.setDarkMode);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const highContrast = useSettingsStore((state) => state.highContrast);
  const setHighContrast = useSettingsStore((state) => state.setHighContrast);
  const textScale = useSettingsStore((state) => state.textScale);
  const setTextScale = useSettingsStore((state) => state.setTextScale);

  const onLanguage = (value: 'fr' | 'en' | 'ar') => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  return (
    <div className="max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl font-black">Parametres utilisateur</h1>

      <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <span className="font-semibold">Mode sombre</span>
        <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
      </label>

      <label className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <span className="font-semibold">Contraste eleve</span>
        <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
      </label>

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="mb-2 font-semibold">Langue</p>
        <div className="flex gap-2">
          {(['fr', 'en', 'ar'] as const).map((item) => (
            <button
              key={item}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${language === item ? 'bg-cyan-700 text-white' : 'bg-white'}`}
              onClick={() => onLanguage(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-3">
        <p className="mb-2 font-semibold">Taille du texte</p>
        <input aria-label="Ajuster la taille du texte" type="range" min={0.9} max={1.3} step={0.1} value={textScale} onChange={(e) => setTextScale(Number(e.target.value))} />
      </div>
    </div>
  );
}
