'use client';

import { useState } from 'react';
import { Server, Settings, X, GripHorizontal } from 'lucide-react';
import ServiceModal from './ServiceModal';
import ConfirmModal from './ConfirmModal';
import { ServiceData, useStore } from '@/store/useStore';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ServiceCardProps {
  service: ServiceData;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const removeService = useStore((state) => state.removeService);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.id });

  // POPRAWKA 1: Używamy CSS.Translate zamiast CSS.Transform (znacznie lepsza wydajność, brak zniekształceń skali)
  const style = {
    transform: CSS.Translate.toString(transform),
    transition, // dnd-kit sam doda odpowiednie transition TYLKO przy puszczaniu kafelka
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  const hrefValue = service.url.startsWith('http') ? service.url : `https://${service.url}`;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        // POPRAWKA 2: transition-all i hover effects są włączone TYLKO gdy NIE przeciągamy kafelka
        className={`group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col aspect-square overflow-hidden ${
          isDragging 
            ? 'shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500 cursor-grabbing' 
            : 'transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1'
        }`}
      >
        <div 
          {...attributes} 
          {...listeners} 
          className="absolute top-2 left-2 p-1.5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing rounded-lg hover:bg-white/10 transition-all z-20 backdrop-blur-sm"
          title="Chwyć, aby przenieść"
        >
          <GripHorizontal size={16} />
        </div>

        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-gray-900/60 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all z-20 backdrop-blur-sm"
          title="Usuń kafelek"
        >
          <X size={16} />
        </button>

        <a 
          href={hrefValue} target="_blank" rel="noopener noreferrer"
          className="flex-1 cursor-pointer flex items-center justify-center p-6 relative overflow-hidden z-10"
          title={`Otwórz ${service.name}`}
        >
          {service.icon ? (
            <img src={service.icon} alt={service.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-lg pointer-events-none" />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center bg-blue-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-300 pointer-events-none">
              <Server size={40} className="text-blue-400" />
            </div>
          )}
        </a>

        <button 
          onClick={handleOpenModal}
          className="h-[15%] min-h-[40px] border-t border-white/10 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors relative z-10 w-full"
        >
          <span>Parametry</span>
          <Settings size={14} />
        </button>
      </div>
      
      <ServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} service={service} />
      <ConfirmModal 
        isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={() => removeService(service.id)} 
        title="Usuwanie usługi" message={`Czy na pewno chcesz trwale usunąć kafelek "${service.name}"? Tej operacji nie można cofnąć.`}
      />
    </>
  );
}