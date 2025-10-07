import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type User = { email: string } | null;

interface AuthState {
  isAuthenticated: boolean;
  user: User;
}

const initialState: AuthState = { isAuthenticated: false, user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ email: string }>) {
      state.isAuthenticated = true;
      state.user = { email: action.payload.email };
    },
    logout() {
      return initialState;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
