import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../constants/theme';
import { LOYALTY_TIERS, LoyaltyTier } from '../utils/api';

type Props = {
  currentTier: LoyaltyTier;
  totalRequests: number;
};

export default function LoyaltyProgress({ currentTier, totalRequests }: Props) {
  const tiers = Object.entries(LOYALTY_TIERS);
  const currentIndex = tiers.findIndex(([id]) => id === currentTier.id);
  const nextTier = tiers[currentIndex + 1];
  
  let progress = 100;
  let requestsToNext = 0;
  
  if (nextTier) {
    const nextConfig = nextTier[1];
    const prevMin = currentTier.min_requests;
    const nextMin = nextConfig.min_requests;
    const range = nextMin - prevMin;
    const current = totalRequests - prevMin;
    progress = Math.min((current / range) * 100, 100);
    requestsToNext = nextMin - totalRequests;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tierInfo}>
          <View style={[styles.badge, { backgroundColor: currentTier.color + '30' }]}>
            <Ionicons name="shield" size={20} color={currentTier.color} />
          </View>
          <View>
            <Text style={styles.tierName}>{currentTier.name}</Text>
            <Text style={styles.discount}>
              {currentTier.discount > 0 ? `${currentTier.discount}% reducere` : 'Nivel de start'}
            </Text>
          </View>
        </View>
        <Text style={styles.requests}>{totalRequests} cereri</Text>
      </View>
      
      {nextTier && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: currentTier.color }]} />
          </View>
          <Text style={styles.progressText}>
            Încă {requestsToNext} cereri până la <Text style={{ color: nextTier[1].color, fontWeight: '700' }}>{nextTier[1].name}</Text>
          </Text>
        </View>
      )}
      
      {!nextTier && (
        <View style={styles.maxLevel}>
          <Ionicons name="diamond" size={16} color={currentTier.color} />
          <Text style={styles.maxLevelText}>Ai atins nivelul maxim!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierName: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  discount: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
  requests: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  maxLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  maxLevelText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
});
