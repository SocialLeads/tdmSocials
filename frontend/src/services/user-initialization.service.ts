import { store } from '../store';
import { setCurrentUser, setInitializing, clearUser } from '../store/slices/userSlice';
import { usersApi } from '../api/users.api';

class UserInitializationService {
  private isInitialized = false;

  async initializeUser() {
    if (this.isInitialized) return;

    const token = localStorage.getItem('authToken');

    if (!token) {
      store.dispatch(setInitializing(false));
      this.isInitialized = true;
      return;
    }

    try {
      const userData = await usersApi.getCurrentUser();

      store.dispatch(setCurrentUser({
        uid: userData.id.toString(),
        email: userData.email,
        displayName: userData.username,
        role: userData.role,
      }));

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize user:', error);
      store.dispatch(clearUser());
      localStorage.removeItem('authToken');
    } finally {
      store.dispatch(setInitializing(false));
    }
  }

  reset() {
    this.isInitialized = false;
  }
}

export const userInitializationService = new UserInitializationService();
