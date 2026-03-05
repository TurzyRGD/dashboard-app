'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Save, Upload, Loader2 } from 'lucide-react';
import ParameterRow from './ParameterRow';
import { useStore, ServiceData } from '@/store/useStore';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceData;
}

export default function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const parameters = useStore((state) => state.parameters);
  const updateServiceUrl = useStore((state) => state.updateServiceUrl);
  const updateServiceName = useStore((state) => state.updateServiceName);
  const updateServiceIcon = useStore((state) => state.updateServiceIcon);
  const updateServiceParameterValue = useStore((state) => state.updateServiceParameterValue);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(service.name);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveName = () => {
    updateServiceName(service.id, tempName);
    setIsEditingName(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        updateServiceIcon(service.id, data.path);
      } else {
        alert('Błąd wgrywania: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Filtrujemy tylko te parametry, które w ustawieniach zostały przypisane do tej konkretnej usługi
  const activeParameters = parameters.filter(p => p.assignedServices.includes(service.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              {isEditingName ? (
                <div className="flex items-center gap-2 flex-1 mr-4">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-blue-500 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                  />
                  <button onClick={handleSaveName} className="text-green-400 hover:text-green-300 p-1"><Save size={18} /></button>
                  <button onClick={() => setIsEditingName(false)} className="text-red-400 hover:text-red-300 p-1"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{service.name}</h2>
                  <button onClick={() => { setTempName(service.name); setIsEditingName(true); }} className="text-gray-500 hover:text-blue-400 transition-colors">
                    <Pencil size={16} />
                  </button>
                </div>
              )}

              <button onClick={onClose} className="p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all ml-auto">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              <ParameterRow 
                label="URL usługi" 
                initialValue={service.url} 
                type="url"
                onSave={(newUrl) => updateServiceUrl(service.id, newUrl)} 
              />
              
              <div className="my-4 border-t border-white/10"></div>

              {activeParameters.map((param) => (
                <ParameterRow 
                  key={param.id} 
                  label={param.label} 
                  type={param.type}
                  initialValue={service.parameterValues[param.id] || ''} 
                  onSave={(newValue) => updateServiceParameterValue(service.id, param.id, newValue)}
                />
              ))}

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Ikona usługi</p>
                    <label className="flex items-center gap-2 w-fit cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {isUploading ? 'Wgrywanie...' : 'Wybierz plik'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {service.icon && (
                    <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden border border-white/10 p-1">
                       <img src={service.icon} alt="Podgląd ikony" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}