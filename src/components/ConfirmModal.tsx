'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onClose} // Zamknięcie po kliknięciu w tło
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // Blokuje zamknięcie po kliknięciu w sam modal
          >
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-2">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{message}</p>
            </div>
            
            <div className="flex border-t border-gray-800">
              <button 
                onClick={onClose} 
                className="flex-1 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium"
              >
                Anuluj
              </button>
              <div className="w-[1px] bg-gray-800"></div>
              <button 
                onClick={() => { onConfirm(); onClose(); }} 
                className="flex-1 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors font-bold"
              >
                Usuń
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}