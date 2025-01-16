import { create } from 'zustand';

interface SnackbarState {
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error' | 'warning' | 'info';
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  closeSnackbar: () => void;
}

const useSnackbarStore = create<SnackbarState>((set) => ({
  snackbarOpen: false,
  snackbarMessage: '',
  snackbarSeverity: 'success', // 'success', 'error', 'warning', 'info'

  // Method to show the Snackbar
  showSnackbar: (message, severity = 'success') =>
    set({ snackbarOpen: true, snackbarMessage: message, snackbarSeverity: severity }),

  // Method to close the Snackbar
  closeSnackbar: () => set({ snackbarOpen: false }),
}));

export default useSnackbarStore;
