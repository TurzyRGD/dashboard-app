'use client';

import { useState } from 'react';
import { ClipboardCopy, Pencil, Save, X, Eye, EyeOff, Loader2, Upload } from 'lucide-react';

interface ParameterRowProps {
  label: string;
  initialValue: string;
  type?: 'text' | 'url' | 'file';
  onSave?: (newValue: string) => void;
}

export default function ParameterRow({ label, initialValue, type = 'text', onSave }: ParameterRowProps) {
  const [value, setValue] = useState(initialValue);
  const [tempValue, setTempValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Stany dla załączników
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => { setTempValue(value); setIsEditing(true); };
  const handleCancel = () => { setTempValue(value); setIsEditing(false); };
  
  const handleSave = () => {
    setValue(tempValue);
    setIsEditing(false);
    if (onSave) onSave(tempValue);
  };

  // Obsługa wgrania pliku jako wartości parametru
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
        setTempValue(data.path); // path będzie wyglądał np. /uploads/123-plik.conf
      } else {
        alert('Błąd wgrywania: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Pobieranie plain text z serwera do podglądu
  const handleTogglePreview = async () => {
    if (previewContent !== null) {
      setPreviewContent(null);
      return;
    }
    if (!value) return;

    setIsPreviewLoading(true);
    try {
      const res = await fetch(value);
      const text = await res.text();
      setPreviewContent(text);
    } catch (e) {
      setPreviewContent('Błąd pobierania zawartości pliku.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const hrefValue = value.startsWith('http') ? value : `https://${value}`;

  return (
    <div className="flex flex-col mb-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between p-3">
        <div className="flex-1 pr-4 overflow-hidden">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
          
          {isEditing ? (
            type === 'file' ? (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm">
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Wybierz plik z dysku
                  <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
                </label>
                <span className="text-xs text-gray-400 truncate w-48">{tempValue ? tempValue.split('/').pop() : 'Brak pliku'}</span>
              </div>
            ) : (
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full bg-gray-800 text-white border border-blue-500 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
              />
            )
          ) : (
            type === 'url' ? (
              value ? (
                <a href={hrefValue} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate block w-fit" title="Otwórz link">
                  {value}
                </a>
              ) : <p className="text-sm text-gray-500 italic">Brak linku</p>
            ) : type === 'file' ? (
              <p className="text-sm text-gray-100 truncate">{value ? value.split('/').pop() : <span className="text-gray-500 italic">Brak załącznika</span>}</p>
            ) : (
              <p className="text-sm text-gray-100 truncate">{value || <span className="text-gray-500 italic">Brak wartości</span>}</p>
            )
          )}
        </div>
        
        <div className="flex items-center gap-2 relative">
          {copied && <span className="absolute -top-8 right-0 text-xs bg-green-500 text-white px-2 py-1 rounded shadow-lg animate-pulse z-10">Skopiowano!</span>}
          
          {!isEditing ? (
            <>
              {type === 'file' ? (
                <button onClick={handleTogglePreview} className={`p-1.5 transition-colors ${previewContent !== null ? 'text-blue-400 bg-blue-500/10 rounded' : 'text-gray-400 hover:text-white'}`} title="Podgląd pliku (Plain Text)">
                  {isPreviewLoading ? <Loader2 size={16} className="animate-spin" /> : previewContent !== null ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              ) : (
                <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Kopiuj">
                  <ClipboardCopy size={16} />
                </button>
              )}
              <button onClick={handleEdit} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors" title="Edytuj">
                <Pencil size={16} />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSave} className="p-1.5 text-green-400 hover:text-green-300 transition-colors" title="Zapisz" disabled={isUploading}>
                <Save size={16} />
              </button>
              <button onClick={handleCancel} className="p-1.5 text-red-400 hover:text-red-300 transition-colors" title="Anuluj" disabled={isUploading}>
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ROZWIJANY PANEL Z PODGLĄDEM ZAWARTOSCI PLIKU */}
      {type === 'file' && previewContent !== null && (
        <div className="border-t border-white/10 p-4 bg-[#0a0c10] rounded-b-lg">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto custom-scrollbar">
            {previewContent || 'Plik jest pusty.'}
          </pre>
        </div>
      )}
    </div>
  );
}