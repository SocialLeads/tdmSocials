import { store } from '../store';
import { clearUser } from '../store/slices/userSlice';
import { userInitializationService } from './user-initialization.service';

class UserService {
  /**
   * Sign out the user completely
   * Clears all user data from Redux, localStorage, and resets initialization
   */
  clearUserAuthData() {
    store.dispatch(clearUser());
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    userInitializationService.reset();
  }
}

export const userService = new UserService();