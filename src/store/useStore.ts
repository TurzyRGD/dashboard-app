import { create } from 'zustand';

export interface ServiceData {
  id: string;
  name: string;
  url: string;
  icon?: string;
  parameterValues: Record<string, string>;
}

export interface ParameterDef {
  id: string;
  label: string;
  type: 'text' | 'url' | 'file';
  assignedServices: string[];
}

interface AppState {
  logo: string; // NOWE: Globalne logo
  parameters: ParameterDef[];
  services: ServiceData[];
  updateLogo: (newLogo: string) => void; // NOWE
  saveParameters: (newParameters: ParameterDef[]) => void;
  updateServiceUrl: (id: string, newUrl: string) => void;
  updateServiceName: (id: string, newName: string) => void;
  updateServiceIcon: (id: string, newIcon: string) => void;
  updateServiceParameterValue: (serviceId: string, paramId: string, value: string) => void;
  addService: () => void;
  removeService: (id: string) => void;
  initFromServer: (data: any) => void;
  reorderServices: (activeId: string, overId: string) => void;
}

const initialServices: ServiceData[] = [
  { id: '1', name: 'NPM Panel', url: 'http://51.195.44.224:81', icon: '', parameterValues: {} },
  { id: '2', name: 'Uptime Kuma', url: 'http://192.168.1.102:3001', icon: '', parameterValues: {} },
  { id: '3', name: 'Zabbix', url: 'http://192.168.1.103:80', icon: '', parameterValues: {} },
  { id: '4', name: 'RustDesk', url: 'http://192.168.1.104', icon: '', parameterValues: {} },
];

const initialParameters: ParameterDef[] = Array.from({ length: 10 }, (_, i) => ({
  id: `param-${i + 1}`,
  label: `Parametr ${i + 1}`,
  type: 'text',
  assignedServices: initialServices.map(s => s.id),
}));

export const useStore = create<AppState>((set) => ({
  logo: '',
  parameters: initialParameters,
  services: initialServices,
  
  updateLogo: (newLogo) => set({ logo: newLogo }),
  saveParameters: (newParameters) => set({ parameters: newParameters }),
    
  updateServiceUrl: (id, newUrl) =>
    set((state) => ({ services: state.services.map((srv) => srv.id === id ? { ...srv, url: newUrl } : srv) })),
  updateServiceName: (id, newName) =>
    set((state) => ({ services: state.services.map((srv) => srv.id === id ? { ...srv, name: newName } : srv) })),
  updateServiceIcon: (id, newIcon) =>
    set((state) => ({ services: state.services.map((srv) => srv.id === id ? { ...srv, icon: newIcon } : srv) })),
  updateServiceParameterValue: (serviceId, paramId, value) =>
    set((state) => ({
      services: state.services.map(srv => {
        if (srv.id !== serviceId) return srv;
        return { ...srv, parameterValues: { ...srv.parameterValues, [paramId]: value } };
      })
    })),
  addService: () =>
    set((state) => ({
      services: [...state.services, { id: Date.now().toString(), name: 'Nowa Usługa', url: 'https://', icon: '', parameterValues: {} }]
    })),
  removeService: (id) =>
    set((state) => ({
      services: state.services.filter((srv) => srv.id !== id),
      parameters: state.parameters.map(p => ({ ...p, assignedServices: p.assignedServices.filter(sId => sId !== id) }))
    })),
  reorderServices: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.services.findIndex((s) => s.id === activeId);
      const newIndex = state.services.findIndex((s) => s.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return state;

      const newServices = [...state.services];
      const [movedItem] = newServices.splice(oldIndex, 1);
      newServices.splice(newIndex, 0, movedItem);

      return { services: newServices };
    }),
  initFromServer: (data) => {
    let params = data.parameters;
    if (!params && data.labels) {
      params = data.labels.map((lbl: string, i: number) => ({
        id: `param-${i + 1}`, label: lbl, type: 'text', assignedServices: data.services.map((s: any) => s.id)
      }));
    } else if (params) {
      params = params.map((p: any) => ({ ...p, type: p.type || 'text' }));
    }
    set({ 
      logo: data.logo || '',
      parameters: params || initialParameters, 
      services: data.services.map((s: any) => ({ ...s, parameterValues: s.parameterValues || {} })) 
    });
  },
}));

if (typeof window !== 'undefined') {
  useStore.subscribe((state, prevState) => {
    if (state.services !== prevState.services || state.parameters !== prevState.parameters || state.logo !== prevState.logo) {
      fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: state.logo, parameters: state.parameters, services: state.services }),
      }).catch(err => console.error('Błąd synchronizacji:', err));
    }
  });
}