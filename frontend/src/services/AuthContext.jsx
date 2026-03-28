import React, { useState, useEffect, createContext, useContext } from 'react';

/**
 * AuthContext — Global Login State Manager
 * ─────────────────────────────────────────
 * This context answers the question: "Who is currently logged in?"
 *
 * It stores the logged-in user's data (name, email, token, role, etc.)
 * in both React state AND localStorage so the login persists after a page refresh.
 *
 * HOW TO USE in any component:
 *   const { user, loginUser, logoutUser, updateUser } = useAuth();
 *
 *   user          → null if not logged in, or: { _id, name, email, role, token, profileImage }
 *   loginUser()   → call after a successful login API response
 *   logoutUser()  → call when user clicks "Log out"
 *   updateUser()  → call to patch specific fields (e.g. new profile photo URL)
 */

// Create the context object — starts as null, will be filled by AuthProvider
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize user from localStorage so the session survives a page refresh.
  // The () => { } form is a "lazy initializer" — runs once on mount, not on every render.
  const [user, setUser] = useState(() => {
    const info = localStorage.getItem('userInfo');
    return info ? JSON.parse(info) : null; // parse saved JSON, or start as null
  });

  // Save user data to localStorage + React state when logging in
  const loginUser = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data)); // persist across refreshes
    setUser(data);
  };

  // Clear everything when logging out
  const logoutUser = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  // Merge a partial update into the existing user object.
  // Useful when only one field changes (e.g. profile photo after upload).
  // Example: updateUser({ profileImage: 'https://...' })
  const updateUser = (data) => {
    const merged = { ...user, ...data }; // keep existing fields, overwrite changed ones
    localStorage.setItem('userInfo', JSON.stringify(merged));
    setUser(merged);
  };

  // Provide the user state and all action functions to every child component
  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — shortcut so components write useAuth() instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext);
}
