import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  doc,
  getDoc
} from "firebase/firestore";

import {
  auth,
  db
} from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  const [userData, setUserData] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {

        try {

          if (currentUser) {

            setUser(currentUser);

            const userRef = doc(
              db,
              "users",
              currentUser.uid
            );

            const adminRef = doc(
              db,
              "admins",
              currentUser.uid
            );

            // Load both documents at the same time
            const [userSnap, adminSnap] =
              await Promise.all([
                getDoc(userRef),
                getDoc(adminRef)
              ]);

            // User data
            if (userSnap.exists()) {

              setUserData(
                userSnap.data()
              );

            } else {

              setUserData(null);

            }

            // Admin check
            if (adminSnap.exists()) {

              const adminData =
                adminSnap.data();

              setIsAdmin(
                adminData.status ===
                "active"
              );

            } else {

              setIsAdmin(false);

            }

          } else {

            setUser(null);
            setUserData(null);
            setIsAdmin(false);

          }

        } catch (err) {

          console.error(
            "AuthContext Error:",
            err
          );

          setUserData(null);
          setIsAdmin(false);

        } finally {

          setLoading(false);

        }

      }
    );

    return () => unsubscribe();

  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isAdmin,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}