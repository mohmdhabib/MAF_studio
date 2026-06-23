import { create } from 'zustand';

interface AIState {
  availableModels: string[];
  selectedModel: string;
  isFetchingModels: boolean;
  fetchModels: () => Promise<void>;
  setSelectedModel: (model: string) => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  availableModels: [],
  selectedModel: import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1',
  isFetchingModels: false,
  fetchModels: async () => {
    set({ isFetchingModels: true });
    try {
      const response = await fetch('http://localhost:4000/api/health');
      const data = await response.json();
      if (data.ok && data.models) {
        const models = data.models.map((m: any) => m.name);
        const currentModel = get().selectedModel;
        set({ 
          availableModels: models,
          selectedModel: models.includes(currentModel) ? currentModel : (models[0] || currentModel)
        });
      }
    } catch (err) {
      console.error('Failed to fetch Ollama models:', err);
    } finally {
      set({ isFetchingModels: false });
    }
  },
  setSelectedModel: (model) => set({ selectedModel: model }),
}));
