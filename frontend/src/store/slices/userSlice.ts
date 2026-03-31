import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role?: UserRole;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  isInitializing: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  accessToken: null,
  isInitializing: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
    setTokens: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.accessToken = null;
    },
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.isInitializing = action.payload;
    },
  },
});

export const {
  setCurrentUser,
  setTokens,
  updateAccessToken,
  clearUser,
  setInitializing,
} = userSlice.actions;

export default userSlice.reducer;
