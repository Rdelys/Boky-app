import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../theme/colors';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  tone?: 'muted' | 'danger';
};

export function EmptyState({ icon, title, tone = 'muted' }: Props) {
  const color = tone === 'danger' ? colors.danger : colors.muted;
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconWrap, tone === 'danger' && styles.iconWrapDanger]}>
        <Ionicons name={icon} size={30} color={color} />
      </View>
      <Text style={[styles.text, { color }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingTop: 60 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(122,106,93,.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconWrapDanger: { backgroundColor: colors.dangerBg },
  text: { textAlign: 'center', fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20 },
});
