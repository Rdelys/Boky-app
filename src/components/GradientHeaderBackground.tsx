import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

/**
 * Fond de header dégradé (haut plus sombre -> bas légèrement plus clair).
 * Nécessite expo-linear-gradient : `npx expo install expo-linear-gradient`
 * (module officiel Expo, déjà présent dans la plupart des projets managés).
 */
export function GradientHeaderBackground() {
  return (
    <LinearGradient
      colors={[colors.maroon950, colors.maroon900]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
