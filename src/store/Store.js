import { create } from 'zustand';

export const useJournalStore = create((set) => ({
  journals: [], // array to store each journal entry
  addJournal: (entry) =>
    set((state) => ({
      journals: [...state.journals, { id: Date.now(), ...entry }],
    })),
    updateJournal: (updatedEntry) =>
    set((state) => ({
      journals: state.journals.map((journal) =>
        journal.id === updatedEntry.id ? { ...journal, ...updatedEntry } : journal
      ),
    })),
  removeJournal: (id) =>
    set((state) => ({
      journals: state.journals.filter((journal) => journal.id !== id),
    })),
}));