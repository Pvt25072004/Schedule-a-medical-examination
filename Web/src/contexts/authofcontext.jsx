// src/service/authContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { auth } from "../services/firebase";   // nhớ đúng path firebase.js

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user); // xem user là gì
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);


  // Hàm đăng nhập
  const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login success:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Login failed:", error.code, error.message);
    throw error;
  }
};


  // Hàm đăng xuất
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
