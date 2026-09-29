import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/**
 * Écran de chargement affiché pendant l'initialisation (polices, session).
 * Volontairement minimal : l'app démarre vite, donc un simple fondu
 * d'entrée (260ms, sans boucle) suffit et reste fluide sur tous les
 * appareils — pas de pulsation ni de points animés en continu.
 */
export function LoadingScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={styles.screen}>
      <Animated.Image
        source={require('../../assets/images/logo.png')}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.maroon950, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 220, height: 96 },
});