import React from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../constants/theme';

type Props = {
  latitude: number;
  longitude: number;
  venueName: string;
  price?: string;
};

// Web-only map component (no native dependencies)
function WebMapView({ latitude, longitude, venueName }: Props) {
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  if (!latitude || !longitude) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="location-outline" size={32} color={colors.textTertiary} />
        <Text style={styles.placeholderText}>Locația nu este disponibilă pe hartă</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.webMapContainer} onPress={openGoogleMaps} activeOpacity={0.8}>
      <View style={styles.webMapContent}>
        <View style={styles.mapIconCircle}>
          <Ionicons name="map" size={32} color={colors.primary} />
        </View>
        <Text style={styles.webMapTitle}>{venueName}</Text>
        <Text style={styles.webMapCoords}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        <View style={styles.openMapBtn}>
          <Ionicons name="open-outline" size={16} color={colors.background} />
          <Text style={styles.openMapBtnText}>Deschide în Google Maps</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function VenueMap(props: Props) {
  const { latitude, longitude, venueName, price } = props;

  // Always use web-friendly version for now (works on all platforms)
  // Native maps can be enabled later with proper conditional imports
  if (!latitude || !longitude) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="location-outline" size={32} color={colors.textTertiary} />
        <Text style={styles.placeholderText}>Locația nu este disponibilă pe hartă</Text>
      </View>
    );
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={styles.webMapContainer} onPress={openGoogleMaps} activeOpacity={0.8}>
      <View style={styles.webMapContent}>
        <View style={styles.mapIconCircle}>
          <Ionicons name="map" size={32} color={colors.primary} />
        </View>
        <Text style={styles.webMapTitle}>{venueName}</Text>
        <Text style={styles.webMapCoords}>
          📍 {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        {price && (
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>{price}</Text>
          </View>
        )}
        <View style={styles.openMapBtn}>
          <Ionicons name="navigate" size={16} color={colors.background} />
          <Text style={styles.openMapBtnText}>Vezi pe hartă</Text>
        </View>
      </View>
      <View style={styles.exactLabel}>
        <Ionicons name="location" size={14} color={colors.primary} />
        <Text style={styles.exactLabelText}>Locație exactă</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: 150,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  placeholderText: {
    ...typography.bodySm,
    color: colors.textTertiary,
  },
  webMapContainer: {
    height: 180,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  webMapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  mapIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  webMapTitle: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  webMapCoords: {
    ...typography.bodySm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  priceTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: spacing.xs,
  },
  priceTagText: {
    ...typography.bodySm,
    color: colors.background,
    fontWeight: '700',
  },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  openMapBtnText: {
    ...typography.bodySm,
    color: colors.background,
    fontWeight: '600',
  },
  exactLabel: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  exactLabelText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'none',
  },
});
