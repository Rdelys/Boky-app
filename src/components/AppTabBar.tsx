// src/components/AppTabBar.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fonts, radius, shadows } from '../theme/colors';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Books: { active: 'book', inactive: 'book-outline' },
  Orders: { active: 'receipt', inactive: 'receipt-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 14) }]} pointerEvents="box-none">
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = (options.title ?? route.name) as string;
          const focused = state.index === index;
          const icon = ICONS[route.name] ?? ICONS.Books;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.item} hitSlop={6}>
              <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                <Ionicons
                  name={focused ? icon.active : icon.inactive}
                  size={19}
                  color={focused ? colors.maroon950 : 'rgba(246,239,221,.75)'}
                />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.maroon950,
    borderRadius: radius.xl,
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 420,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(233,178,63,.18)',
    ...shadows.floating,
  },
  item: { alignItems: 'center', gap: 4, flex: 1, paddingVertical: 2 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: { backgroundColor: colors.gold },
  label: { fontSize: 10, color: 'rgba(246,239,221,.55)', fontFamily: fonts.sansMedium },
  labelActive: { color: colors.cream, fontFamily: fonts.sansSemiBold },
});