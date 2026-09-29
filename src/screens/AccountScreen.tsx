import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileScreen } from './ProfileScreen';
import { AuthScreen } from './AuthScreen';

/**
 * Onglet "Compte" : affiche le profil pour un utilisateur connecté, ou
 * l'écran de connexion/inscription sinon. C'est le seul écran derrière cet
 * onglet — le contenu change avec l'état de connexion, pas la navigation.
 */
export function AccountScreen() {
  const { user } = useAuth();
  return user ? <ProfileScreen /> : <AuthScreen />;
}