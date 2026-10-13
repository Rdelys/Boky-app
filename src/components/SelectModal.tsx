import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadows, spacing } from '../theme/colors';

export type SelectOption = { value: string; label: string };

type Props = {
  label: string;
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  onSelect: (value: string) => void;
};

/** Liste déroulante en fenêtre modale (ville, quartier, coopérative, créneau VIP). */
export function SelectModal({ label, placeholder, value, options, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={styles.select}>
        <Text style={current ? styles.value : styles.placeholder} numberOfLines={1}>
          {current ? current.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => {
                      onSelect(o.value);
                      setOpen(false);
                    }}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{o.label}</Text>
                    {active ? <Ionicons name="checkmark-circle" size={18} color={colors.gold} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.sansSemiBold, color: colors.ink, marginBottom: 8, fontSize: 13, marginTop: 4 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  value: { flex: 1, color: colors.ink, fontFamily: fonts.sans },
  placeholder: { flex: 1, color: colors.muted, fontFamily: fonts.sans },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.floating,
  },
  sheetTitle: {
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    fontSize: 13,
    marginBottom: spacing.sm,
    paddingHorizontal: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  optionActive: { backgroundColor: 'rgba(233,178,63,.14)' },
  optionText: { flex: 1, color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 14 },
  optionTextActive: { color: colors.maroon900, fontFamily: fonts.sansSemiBold },
});