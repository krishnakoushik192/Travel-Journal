import { create } from 'zustand';

export const useJournalStore = create((set) => ({
  journals: [], // array to store each journal entry
  addJournal: (entry) =>
    set((state) => ({
      journals: [...state.journals, { id: Date.now(), ...entry }],
    })),
  removeJournal: (id) =>
    set((state) => ({
      journals: state.journals.filter((journal) => journal.id !== id),
    })),
}));