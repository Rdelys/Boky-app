import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radius, shadows } from '../theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'gold';
  loading?: boolean;
  disabled?: boolean;
};

/**
 * variant "primary"  -> bouton bordeaux en dégradé (btn-modal-primary du site)
 * variant "gold"     -> bouton doré en dégradé (btn-primary du site, CTA principaux)
 * variant "ghost"    -> bouton contour (btn-ghost / btn-login du site)
 */
export function Button({ title, onPress, variant = 'primary', loading, disabled }: Props) {
  const isDisabled = disabled || loading;

  const content = loading ? (
    <ActivityIndicator color={variant === 'gold' ? colors.maroon950 : colors.cream} />
  ) : (
    <Text
      style={[
        styles.text,
        variant === 'gold' && styles.textDark,
        variant === 'ghost' && styles.textGhost,
      ]}
    >
      {title}
    </Text>
  );

  if (variant === 'ghost') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.base,
          styles.ghost,
          isDisabled && styles.disabled,
          pressed && !isDisabled && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  const gradientColors: [string, string] =
    variant === 'gold' ? [colors.gold, colors.goldDim] : [colors.maroon800, colors.maroon900];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.base, shadows.subtle]}
      >
        {content}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ghost: { backgroundColor: 'transparent', borderColor: colors.maroon800 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  text: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 15 },
  textDark: { color: colors.maroon950 },
  textGhost: { color: colors.maroon800 },
});