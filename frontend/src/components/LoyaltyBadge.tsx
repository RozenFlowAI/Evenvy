import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../constants/theme';
import { LOYALTY_TIERS } from '../utils/api';

type Props = {
  tierId: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
};

export default function LoyaltyBadge({ tierId, size = 'medium', showLabel = true }: Props) {
  const tier = LOYALTY_TIERS[tierId] || LOYALTY_TIERS.bronze;
  
  const sizes = {
    small: { icon: 14, badge: 20, font: 10 },
    medium: { icon: 18, badge: 28, font: 12 },
    large: { icon: 24, badge: 40, font: 14 },
  };
  
  const s = sizes[size];
  
  return (
    <View style={styles.container}>
      <View style={[styles.badge, { width: s.badge, height: s.badge, backgroundColor: tier.color + '30' }]}>
        <Ionicons name={tier.icon as any} size={s.icon} color={tier.color} />
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize: s.font, color: tier.color }]}>{tier.name}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  badge: { borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '700' },
});
