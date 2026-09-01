import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../core/firebase';
import { userService } from '../services/entities.service';
import { auditService } from '../services/audit.service';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  activeRole: UserRole;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('National Admin');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await userService.getById(user.uid);
          if (profile) {
            setUserProfile(profile);
            setActiveRole(profile.role);
          } else {
            // Default fallback profile for newly logged in user
            const defaultProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'officer@bhumishield.gov.in',
              displayName: user.displayName || 'Government Officer',
              role: 'National Admin',
              isActive: true,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            setUserProfile(defaultProfile);
            setActiveRole(defaultProfile.role);
          }
        } catch (e) {
          console.warn('Error fetching user profile:', e);
        }
      } else {
        // Fallback default demonstration session
        const demoProfile: UserProfile = {
          uid: 'demo-user-master-001',
          email: 'admin.national@bhumishield.gov.in',
          displayName: 'Dr. Rajesh Verma, IAS',
          role: activeRole,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setUserProfile(demoProfile);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [activeRole]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await auditService.logAction({
        targetCollection: 'users',
        targetDocId: cred.user.uid,
        action: 'LOGIN',
        actorId: cred.user.uid,
        actorName: cred.user.email || 'Officer',
        actorRole: activeRole,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await auditService.logAction({
        targetCollection: 'users',
        targetDocId: currentUser.uid,
        action: 'UPDATE',
        actorId: currentUser.uid,
        actorName: currentUser.email || 'Officer',
        actorRole: activeRole,
        diffPayload: { event: 'LOGOUT' },
      });
    }
    await fbSignOut(auth);
    setUserProfile(null);
  };

  const switchDemoRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (userProfile) {
      setUserProfile({ ...userProfile, role: newRole });
    }
    auditService.logAction({
      targetCollection: 'users',
      targetDocId: userProfile?.uid || 'demo-uid',
      action: 'ROLE_SWITCH',
      actorId: userProfile?.uid || 'demo-uid',
      actorName: userProfile?.displayName || 'Officer',
      actorRole: newRole,
      diffPayload: { switchedTo: newRole },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        activeRole,
        loading,
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
