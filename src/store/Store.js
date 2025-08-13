// src/store/Store.js
import { create } from 'zustand';
import DatabaseService from '../services/DatabaseService';

export const useJournalStore = create((set, get) => ({
  journals: [],
  isLoading: false,
  error: null,

  // Initialize database and load journals
  initializeStore: async () => {
    set({ isLoading: true, error: null });
    try {
      await DatabaseService.initDB();
      const journals = await DatabaseService.getAllJournals();
      set({ journals, isLoading: false });
    } catch (error) {
      console.error('Error initializing store:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Add a new journal entry
  addJournal: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const journalWithId = {
        ...entry,
        id: entry.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
      };
      
      await DatabaseService.addJournal(journalWithId);
      
      // Update local state
      set((state) => ({
        journals: [journalWithId, ...state.journals],
        isLoading: false
      }));
      
      return journalWithId;
    } catch (error) {
      console.error('Error adding journal:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Update an existing journal entry
  updateJournal: async (updatedEntry) => {
    set({ isLoading: true, error: null });
    try {
      await DatabaseService.updateJournal(updatedEntry);
      
      // Update local state
      set((state) => ({
        journals: state.journals.map((journal) =>
          journal.id === updatedEntry.id ? { ...journal, ...updatedEntry } : journal
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating journal:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Remove a journal entry
  removeJournal: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await DatabaseService.deleteJournal(id);
      
      // Update local state
      set((state) => ({
        journals: state.journals.filter((journal) => journal.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error removing journal:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Simple search journals
  searchJournals: async (searchTerm) => {
    if (!searchTerm.trim()) {
      // If search term is empty, return all journals
      return get().journals;
    }

    set({ isLoading: true, error: null });
    try {
      const results = await DatabaseService.searchJournals(searchTerm);
      set({ isLoading: false });
      return results;
    } catch (error) {
      console.error('Error searching journals:', error);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  // Advanced search with multiple filters
  advancedSearchJournals: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const results = await DatabaseService.advancedSearch(filters);
      set({ isLoading: false });
      return results;
    } catch (error) {
      console.error('Error in advanced search:', error);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  // Get all available tags
  getAllTags: async () => {
    try {
      return await DatabaseService.getAllTags();
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  },

  // Get all available locations
  getAllLocations: async () => {
    try {
      return await DatabaseService.getAllLocations();
    } catch (error) {
      console.error('Error getting locations:', error);
      return [];
    }
  },

  // Get date range of journals
  getDateRange: async () => {
    try {
      return await DatabaseService.getDateRange();
    } catch (error) {
      console.error('Error getting date range:', error);
      return { minDate: null, maxDate: null };
    }
  },

  // Get journal statistics
  getStats: async () => {
    try {
      return await DatabaseService.getJournalStats();
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalJournals: 0,
        totalImages: 0,
        uniqueLocations: 0,
        uniqueTags: 0
      };
    }
  },

  // Refresh journals from database
  refreshJournals: async () => {
    set({ isLoading: true, error: null });
    try {
      const journals = await DatabaseService.getAllJournals();
      set({ journals, isLoading: false });
    } catch (error) {
      console.error('Error refreshing journals:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Clear error state
  clearError: () => set({ error: null }),

  // Get loading state
  getLoadingState: () => get().isLoading,

  // Get error state  
  getError: () => get().error,
}));