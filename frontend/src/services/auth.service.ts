import { store } from '../store';
import { setCurrentUser, setTokens, clearUser } from '../store/slices/userSlice';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';

class AuthService {
  async authenticateUser(identifier: string, password: string) {
    const response = await authApi.login(identifier, password);
    const accessToken = response.accessToken;

    localStorage.setItem('authToken', accessToken);

    const userData = await usersApi.getCurrentUser();
    const currentUser = {
      uid: userData.id?.toString(),
      email: userData.email,
      displayName: userData.username,
      role: userData.role,
    };

    store.dispatch(setCurrentUser(currentUser));
    store.dispatch(setTokens({ accessToken }));

    return response;
  }

  async registerUser(email: string, password: string, username?: string) {
    const response = await authApi.register(email, password, username);
    const accessToken = response.accessToken;

    localStorage.setItem('authToken', accessToken);

    const userData = await usersApi.getCurrentUser();
    const currentUser = {
      uid: userData.id?.toString(),
      email: userData.email,
      displayName: userData.username,
      role: userData.role,
    };

    store.dispatch(setCurrentUser(currentUser));
    store.dispatch(setTokens({ accessToken }));

    return response;
  }

  async signOut() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      store.dispatch(clearUser());
      localStorage.removeItem('authToken');
    }
  }
}

export const authService = new AuthService();
