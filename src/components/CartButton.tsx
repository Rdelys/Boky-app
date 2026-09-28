import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { LanguageSwitcherNav } from './LanguageSwitcher';
import { colors, fonts } from '../theme/colors';

export function HeaderActions() {
  const navigation = useNavigation<any>();
  const { count } = useCart();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <LanguageSwitcherNav />
      <Pressable onPress={() => navigation.navigate('Cart')} hitSlop={10} style={styles.btn}>
        <Ionicons name="cart-outline" size={22} color={colors.cream} />
        {count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { padding: 4, marginRight: 4 },
  badge: {
    position: 'absolute', top: -2, right: -4, minWidth: 16, height: 16, borderRadius: 8,
    paddingHorizontal: 4, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: colors.maroon950, fontSize: 10, fontFamily: fonts.sansSemiBold },
});