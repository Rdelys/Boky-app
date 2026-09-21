import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

type Props = {
  title: string;
  showLogo?: boolean;
};

export function AppHeaderTitle({ title, showLogo = true }: Props) {
  return (
    <View style={styles.wrap}>
      {showLogo ? (
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      ) : null}
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 220 },
  logo: { width: 24, height: 24, borderRadius: 6 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 17 },
});
