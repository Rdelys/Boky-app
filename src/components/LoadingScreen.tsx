import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme/colors';
import { APP_NAME } from '../constants/app';

type Props = {
  /** Petit message optionnel sous le logo (ex: "Chargement..."). */
  label?: string;
};

/**
 * Écran plein cadre affiché pendant le chargement des polices et/ou de la
 * session utilisateur. Remplace l'ActivityIndicator nu par un rendu de
 * marque (logo + pulsation dorée) cohérent avec le style du site.
 *
 * Logo attendu : assets/images/logo.png (racine du projet).
 */
export function LoadingScreen({ label }: Props) {
  const pulse = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.85,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.screen}>
      <View style={styles.glowWrap}>
        <Animated.Image
          source={require('../../assets/images/logo.png')}
          style={[styles.logo, { transform: [{ scale: pulse }] }]}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.appName}>{APP_NAME}</Text>
      <View style={styles.dotsRow}>
        <Dot delay={0} />
        <Dot delay={150} />
        <Dot delay={300} />
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}

function Dot({ delay }: { delay: number }) {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounce, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounce, delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: bounce.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [{ translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.maroon950,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowWrap: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(233,178,63,.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 96,
    height: 96,
  },
  appName: {
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 20,
    marginBottom: spacing.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  label: {
    marginTop: spacing.md,
    color: colors.cream,
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 0.3,
  },
});
