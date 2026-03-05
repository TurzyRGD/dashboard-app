'use client';

import { useState, useEffect } from 'react'; // Dodaj useEffect
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';
import { Settings, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';

export default function Home() {
  const logo = useStore((state) => state.logo);
  const services = useStore((state) => state.services);
  const addService = useStore((state) => state.addService);
  const reorderServices = useStore((state) => state.reorderServices);

  // NOWE: Stan zapobiegający błędom hydracji
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderServices(active.id as string, over.id as string);
    }
  };

  // Jeśli komponent nie jest jeszcze zamontowany, renderujemy szkielet (bez DndContext)
  // zapobiegnie to niezgodności ID między serwerem a klientem
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#0f1115] text-white p-8">
        <header className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-800 rounded-xl border border-gray-700 p-1" />
            <h1 className="text-3xl font-bold text-gray-700">Ładowanie...</h1>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-8">
      <header className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg relative flex items-center justify-center p-1">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
            ) : (
              <span className="text-[10px] text-gray-500 absolute font-bold uppercase text-center leading-tight">Brak<br/>Logo</span>
            )}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Dashboard Usług
          </h1>
        </div>

        <Link href="/settings" className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors shadow-sm">
          <Settings size={18} />
          <span className="hidden sm:inline">Ustawienia</span>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={services.map(s => s.id)} strategy={rectSortingStrategy}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </SortableContext>
        </DndContext>

        <div 
          onClick={addService}
          className="group cursor-pointer bg-transparent border-2 border-dashed border-gray-700 rounded-2xl hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 aspect-square"
        >
          <div className="p-4 bg-gray-800 rounded-full text-gray-400 group-hover:text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <Plus size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-500 group-hover:text-blue-400 transition-colors">Dodaj usługę</h3>
        </div>
      </div>
    </main>
  );
}