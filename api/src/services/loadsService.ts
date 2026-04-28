import { loadsRepository, type Load, type LoadSearchFilters } from '../repositories/loadsRepository.js';

export const loadsService = {
  searchLoads(filters: LoadSearchFilters): Promise<Load[]> {
    return loadsRepository.search(filters);
  },

  listAllLoads(): Promise<Load[]> {
    return loadsRepository.listAll();
  },

  getLoad(loadId: string): Promise<Load | null> {
    return loadsRepository.findById(loadId);
  },

  updateNotes(loadId: string, notes: string | null): Promise<Load | null> {
    return loadsRepository.updateNotes(loadId, notes);
  },
};
