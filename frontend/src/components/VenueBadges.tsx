import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../constants/theme';
import { COMMISSION_BADGES, PROMOTION_BADGES } from '../utils/api';

type Props = {
  commissionBadge?: string;
  promotionBadge?: string;
  style?: any;
};

export default function VenueBadges({ commissionBadge, promotionBadge, style }: Props) {
  if (!commissionBadge && !promotionBadge) return null;
  
  const badge = promotionBadge || commissionBadge;
  const isPromotion = !!promotionBadge;
  
  let badgeColor = colors.primary;
  if (isPromotion) {
    badgeColor = PROMOTION_BADGES[promotionBadge!]?.color || colors.warning;
  } else if (commissionBadge) {
    const commData = Object.entries(COMMISSION_BADGES).find(([_, v]) => v.label === commissionBadge);
    if (commData) badgeColor = commData[1].color;
  }
  
  return (
    <View style={[styles.badge, { backgroundColor: badgeColor }, style]}>
      <Ionicons name={isPromotion ? 'flash' : 'star'} size={10} color="#fff" />
      <Text style={styles.text}>{badge}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
