import { createContext, useEffect, useState } from "react";
import { onAuthChange } from "../../firebaseAuth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener de Firebase Auth
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser ?? null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    uid: user?.uid ?? null,
    isAuthenticated: Boolean(user),
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
