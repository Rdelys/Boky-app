import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

type Props = {
  /** Si fourni, affiche ce texte (écrans Commandes/Compte). Sinon, logo seul en grand (écran Livres). */
  title?: string;
};

export function AppHeaderTitle({ title }: Props) {
  if (!title) {
    return (
      <View style={styles.logoWrap}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Text numberOfLines={1} style={styles.title}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  logoWrap: { alignItems: 'center', justifyContent: 'center', height: 40 },
  logo: { height: 40, width: 190 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 17 },
});