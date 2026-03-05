'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore, ParameterDef, ServiceData } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckSquare, Square, Save, Upload, Loader2, Trash2, Plus, AlertTriangle, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  
  // Dane z globalnego stanu (Zustand)
  const globalLogo = useStore((state) => state.logo);
  const globalParameters = useStore((state) => state.parameters);
  const services = useStore((state) => state.services);
  const saveParameters = useStore((state) => state.saveParameters);
  const updateGlobalLogo = useStore((state) => state.updateLogo);

  // Stan lokalny do edycji (brudnopis)
  const [localLogo, setLocalLogo] = useState('');
  const [localParams, setLocalParams] = useState<ParameterDef[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Stany dla modali ostrzegawczych
  const [paramToDelete, setParamToDelete] = useState<ParameterDef | null>(null);
  const [conflictingServices, setConflictingServices] = useState<ServiceData[]>([]);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // Synchronizacja stanu lokalnego z globalnym przy wejściu
  useEffect(() => {
    if (globalParameters.length > 0) {
      setLocalParams(JSON.parse(JSON.stringify(globalParameters)));
      setLocalLogo(globalLogo || '');
    }
  }, [globalParameters, globalLogo]);

  // MECHANIZM WYKRYWANIA ZMIAN (Dirty State)
  const hasChanges = useMemo(() => {
    // Porównujemy głęboko tablice parametrów oraz logo
    const paramsChanged = JSON.stringify(localParams) !== JSON.stringify(globalParameters);
    const logoChanged = localLogo !== (globalLogo || '');
    return paramsChanged || logoChanged;
  }, [localParams, globalParameters, localLogo, globalLogo]);

  // BLOKADA PRZEGLĄDARKI (Próba odświeżenia strony lub zamknięcia karty)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !saved) {
        e.preventDefault();
        e.returnValue = ''; // Przeglądarka wyświetli systemowe okno potwierdzenia
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, saved]);

  // FUNKCJA BEZPIECZNEGO WYJŚCIA (Obsługa ikony strzałki)
  const handleSafeExit = (e: React.MouseEvent) => {
    if (hasChanges && !saved) {
      e.preventDefault(); // Blokujemy nawigację Linka
      setShowExitWarning(true); // Wyświetlamy nasz customowy modal
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    updateGlobalLogo(localLogo);
    saveParameters(localParams);
    setSaved(true); // Flaga saved wyłącza ostrzeżenia
    
    // Wizualna informacja o zapisie
    setTimeout(() => {
      setIsSaving(false);
      setSaved(false);
    }, 2000);
  };

  const handleAddParameter = () => {
    const newId = `param-${Date.now()}`;
    setLocalParams([...localParams, {
      id: newId, label: 'Nowy parametr', type: 'text', assignedServices: services.map(s => s.id)
    }]);
  };

  const handleRequestDelete = (param: ParameterDef) => {
    const inUse = services.filter(s => s.parameterValues[param.id] && s.parameterValues[param.id].trim() !== '');
    if (inUse.length > 0) {
      setConflictingServices(inUse);
      setParamToDelete(param);
    } else {
      setLocalParams(prev => prev.filter(p => p.id !== param.id));
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-8">
      {/* NAGŁÓWEK Z BLOKADĄ WYJŚCIA */}
      <header className="mb-10 max-w-3xl mx-auto flex items-center justify-between sticky top-0 z-40 bg-[#0f1115]/80 backdrop-blur-md py-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            onClick={handleSafeExit}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Ustawienia Główne</h1>
            {hasChanges && !saved && (
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider animate-pulse">
                Masz niezapisane zmiany!
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-xl ${
            saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
          }`}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saved ? 'Zapisano pomyślnie' : 'Zapisz wszystko'}
        </button>
      </header>

      <div className="max-w-3xl mx-auto space-y-8 pb-32">
        {/* SEKCJA LOGO */}
        <section className="bg-gray-900 border border-gray-800 rounded-3xl p-8">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Wizualizacja Panelu</h2>
          <div className="flex items-center gap-8">
            <div className="w-28 h-28 bg-black/40 rounded-2xl border border-gray-700 flex items-center justify-center p-3">
              {localLogo ? <img src={localLogo} className="max-h-full object-contain" alt="Podgląd" /> : <span className="text-[10px] text-gray-700">BRAK LOGO</span>}
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl cursor-pointer transition-all w-fit">
                <Upload size={18} />
                <span className="font-medium">Wgraj logotyp</span>
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if (!file) return;
                   setIsUploading(true);
                   const formData = new FormData();
                   formData.append('file', file);
                   const res = await fetch('/api/upload', { method: 'POST', body: formData });
                   const data = await res.json();
                   if (data.success) setLocalLogo(data.path);
                   setIsUploading(false);
                }} />
              </label>
              <p className="text-xs text-gray-500">Zalecany format PNG z przezroczystością.</p>
            </div>
          </div>
        </section>

        {/* LISTA PARAMETRÓW */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Parametry Usług</h2>
            <span className="text-xs text-gray-600">{localParams.length} aktywnych definicji</span>
          </div>

          {localParams.map((param) => (
            <div key={param.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative group transition-all hover:border-gray-700">
              <button 
                onClick={() => handleRequestDelete(param)} 
                className="absolute top-6 right-6 p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pr-12">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nazwa etykiety</label>
                  <input 
                    type="text" 
                    value={param.label} 
                    onChange={(e) => setLocalParams(prev => prev.map(p => p.id === param.id ? {...p, label: e.target.value} : p))}
                    className="bg-black/20 border border-gray-700 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Rodzaj danych</label>
                  <select 
                    value={param.type} 
                    onChange={(e) => setLocalParams(prev => prev.map(p => p.id === param.id ? {...p, type: e.target.value as any} : p))}
                    className="bg-black/20 border border-gray-700 rounded-xl px-4 py-3 outline-none cursor-pointer"
                  >
                    <option value="text">Tekst / Hasło</option>
                    <option value="url">Adres WWW (Link)</option>
                    <option value="file">Załącznik (Plik tekstowy)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Powiązanie z usługami</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {services.map(s => (
                    <button 
                      key={s.id} 
                      onClick={() => setLocalParams(prev => prev.map(p => {
                        if (p.id !== param.id) return p;
                        const active = p.assignedServices.includes(s.id);
                        return { ...p, assignedServices: active ? p.assignedServices.filter(id => id !== s.id) : [...p.assignedServices, s.id] };
                      }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs border transition-all ${
                        param.assignedServices.includes(s.id) 
                          ? 'border-blue-500/50 bg-blue-500/10 text-blue-400 font-bold' 
                          : 'border-white/5 bg-white/5 text-gray-500'
                      }`}
                    >
                      {param.assignedServices.includes(s.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      <span className="truncate">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <button 
            onClick={handleAddParameter} 
            className="w-full py-6 border-2 border-dashed border-gray-800 rounded-3xl text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-3 font-bold"
          >
            <Plus size={24} /> Dodaj nowy parametr konfiguracji
          </button>
        </section>
      </div>

      {/* MODAL: POTWIERDZENIE PORZUCENIA ZMIAN */}
      <AnimatePresence>
        {showExitWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Porzucić zmiany?</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">Wprowadziłeś modyfikacje w ustawieniach. Jeśli wyjdziesz teraz, stracisz wszystko, czego nie zapisałeś.</p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setShowExitWarning(false)} 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  Zostań i zapisz
                </button>
                <button 
                  onClick={() => { setShowExitWarning(false); router.push('/'); }} 
                  className="w-full py-4 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl font-bold transition-all"
                >
                  Tak, porzuć zmiany
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: USUWANIE PARAMETRU Z DANYMI */}
      <AnimatePresence>
        {paramToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-gray-900 border border-red-500/30 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Parametr zawiera dane!</h3>
                <p className="text-sm text-gray-400 mt-2">Usunięcie <strong>{paramToDelete.label}</strong> spowoduje utratę wartości w usługach:</p>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-8 pr-2 custom-scrollbar">
                {conflictingServices.map(s => (
                  <div key={s.id} className="bg-black/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">{s.name}</p>
                    <p className="text-sm text-gray-300 italic truncate">"{s.parameterValues[paramToDelete.id]}"</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setParamToDelete(null)} className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold transition-all">Anuluj</button>
                <button onClick={() => { setLocalParams(prev => prev.filter(p => p.id !== paramToDelete.id)); setParamToDelete(null); }} className="flex-1 py-4 bg-red-600 hover:bg-red-500 rounded-2xl font-bold transition-all shadow-lg shadow-red-600/20">Usuń trwale</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}