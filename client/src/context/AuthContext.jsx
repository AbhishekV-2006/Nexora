/**
 * Auth Context Provider
 * 
 * TECHNOLOGY: React Context API for global state management
 * WHY: Manages user authentication state (login, logout, current user info)
 * - Prevents prop drilling of auth data through component tree
 * - Persists auth state across page refreshes via localStorage
 * - Global access to user role for role-based UI rendering
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Stores current user (freelancer/client/admin), JWT token, role
 * - Used by private routes to protect freelancer/client/admin-only pages
 * - Enables conditional rendering based on user role
 * - Foundation for messaging authorization and escrow access control
 */

import React, { createContext, useContext, useEffect, useReducer } from "react";
import { useApi } from "./ApiContext";

/**
 * Auth Context (useReducer) - centralizes auth state and actions
 *
 * WHY use Context + useReducer?
 * - Context API provides a simple way to share global state (auth) without prop drilling.
 * - useReducer is a predictable state machine that's easier to test and reason about
 *   than multiple useState calls when state has multiple related fields (user, token,
 *   loading, error).
 * - For this app, Redux would be overkill: Context + useReducer is lightweight and
 *   perfect for auth state and small global concerns.
 *
 * CONTRACT (what this context provides):
 * - state: { user, token, isLoading, error }
 * - actions: register({name,email,password,role}), login(email,password), logout(),
 *            isAuthenticated(), hasRole(role)
 * - persistence: token + user are saved to localStorage so page refresh keeps auth state
 *
 * SECURITY NOTES:
 * - Token is stored in localStorage for simplicity in this demo. In production,
 *   consider httpOnly cookies for stronger XSS protection and use same-site attributes.
 */

const AuthContext = createContext(null);

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { localStorage.removeItem("user"); return null; }
};

const initialState = {
  user: readStoredUser(),
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: false,
  error: null,
};

const ACTIONS = {
  INIT: "INIT",
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  LOGOUT: "LOGOUT",
  SET_ERROR: "SET_ERROR",
  SET_USER: "SET_USER",
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.LOGIN_SUCCESS:
    case ACTIONS.REGISTER_SUCCESS: {
      const { user, token } = action.payload;
      return { ...state, user, token, isLoading: false, error: null };
    }
    case ACTIONS.SET_USER:
      return { ...state, user: action.payload, isLoading: false, error: null };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case ACTIONS.LOGOUT:
      return { ...initialState, user: null, token: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const api = useApi();

  useEffect(() => {
    // keep localStorage and state in sync (handles manual clearing)
    if (state.token) {
      localStorage.setItem("token", state.token);
    } else {
      localStorage.removeItem("token");
    }

    if (state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [state.token, state.user]);

  // Helper to normalize server responses
  const _extractAuth = (response) => {
    // Accept different shapes defensively
    const payload = response?.data ?? response;
    const accessToken = payload?.accessToken || payload?.token || payload?.data?.accessToken || payload?.data?.token;
    const user = payload?.user || payload?.data?.user || payload?.data;
    return { accessToken, user };
  };

  const register = async (name, email, password, role = "client") => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await api.register({ name, email, password, role });
      const { accessToken, user } = _extractAuth(response);

      if (!accessToken || !user) {
        throw new Error("Invalid registration response from server");
      }

      dispatch({ type: ACTIONS.REGISTER_SUCCESS, payload: { user, token: accessToken } });
      return { success: true, user };
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message || "Registration failed";
      dispatch({ type: ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  const login = async (email, password) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const response = await api.login({ email, password });
      const { accessToken, user } = _extractAuth(response);

      if (!accessToken || !user) {
        throw new Error("Invalid login response from server");
      }

      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: { user, token: accessToken } });
      return { success: true, user };
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err.message || "Login failed";
      dispatch({ type: ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
  };

  const updateUser = (userData) => {
    if (userData) {
      dispatch({ type: ACTIONS.SET_USER, payload: userData });
    }
  };

  const hasRole = (role) => state.user?.role === role;
  const isAuthenticated = () => !!state.token && !!state.user;

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isLoading: state.isLoading,
        error: state.error,
        register,
        login,
        logout,
        updateUser,
        hasRole,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
