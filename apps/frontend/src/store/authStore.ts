import { create } from 'zustand';
interface LoggedInUser {
  role: 'admin' | 'user';
  isLoggedIn: boolean;
}
interface AuthState {
  currentUser: LoggedInUser | undefined; // Replace `unknown` with the specific type of your user object if known
  setCurrentUser: (user: LoggedInUser | undefined) => void; // Replace `unknown` with the specific type of your user object if known
}

const useAuthStore = create<AuthState>((set) => ({
  currentUser: JSON.parse(localStorage.getItem('user') || 'null') ?? undefined,
  setCurrentUser: (user) => set({ currentUser: user }),
}));

export default useAuthStore;
