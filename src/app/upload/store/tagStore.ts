import { create } from 'zustand';

interface TagStore {
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  clearTags: () => void;
  getTags: () => string[];
}

export const useTagStore = create<TagStore>((set, get) => ({
  tags: [],
  
  addTag: (tag: string) => {
    // Normalize tag
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Only add if it doesn't already exist
    set((state) => {
      if (state.tags.includes(normalizedTag)) {
        return state;
      }
      return { tags: [...state.tags, normalizedTag] };
    });
  },
  
  removeTag: (tag: string) => {
    set((state) => ({
      tags: state.tags.filter((t) => t !== tag)
    }));
  },
  
  clearTags: () => {
    set({ tags: [] });
  },
  
  getTags: () => {
    return get().tags;
  }
})); 