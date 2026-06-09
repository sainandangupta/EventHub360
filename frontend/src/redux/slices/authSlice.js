import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      token: null,
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    };
  }
  
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  return {
    token: token || null,
    isAuthenticated: !!token,
    user: user && user !== "undefined" ? JSON.parse(user) : null,
    loading: false,
    error: null
  };
};

const initialState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
