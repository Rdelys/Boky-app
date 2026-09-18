import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '../theme/colors';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'gold';
  loading?: boolean;
  disabled?: boolean;
};

/**
 * variant "primary"  -> bouton bordeaux plein (btn-modal-primary du site)
 * variant "gold"     -> bouton doré (btn-primary du site, CTA principaux)
 * variant "ghost"    -> bouton contour (btn-ghost / btn-login du site)
 */
export function Button({ title, onPress, variant = 'primary', loading, disabled }: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'gold' && styles.gold,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
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
      )}
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
  primary: { backgroundColor: colors.maroon900 },
  gold: { backgroundColor: colors.gold },
  ghost: { backgroundColor: 'transparent', borderColor: colors.maroon800 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
  text: { color: colors.cream, fontWeight: '600', fontSize: 15 },
  textDark: { color: colors.maroon950 },
  textGhost: { color: colors.maroon800 },
});
