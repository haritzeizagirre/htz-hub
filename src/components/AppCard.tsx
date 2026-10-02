import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Trophy,
  Terminal,
  Wrench,
  Activity,
  Layers,
  Star,
  ChevronRight,
} from 'lucide-react-native';
import { IntegratedAppManifest } from '../types';
import { useHub } from '../context/HubContext';
import { HtzCard, HtzBadge, HtzButton, htzTokens } from './htz';

interface AppCardProps {
  app: IntegratedAppManifest;
  onPress: () => void;
}

const renderAppIcon = (iconName: string, color: string, size: number = 24) => {
  switch (iconName) {
    case 'Trophy':
      return <Trophy size={size} color={color} />;
    case 'Terminal':
      return <Terminal size={size} color={color} />;
    case 'Wrench':
      return <Wrench size={size} color={color} />;
    case 'Activity':
      return <Activity size={size} color={color} />;
    default:
      return <Layers size={size} color={color} />;
  }
};

export const AppCard: React.FC<AppCardProps> = ({ app, onPress }) => {
  const { colors, isFavorite, toggleFavorite } = useHub();
  const fav = isFavorite(app.id);

  return (
    <HtzCard elevated onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: `${app.accentColor}20` },
          ]}
        >
          {renderAppIcon(app.icon, app.accentColor, 26)}
        </View>

        <View style={styles.badgeRow}>
          {app.badge && (
            <HtzBadge
              variant="success"
              label={app.badge}
              style={{ backgroundColor: `${app.accentColor}20` }}
            />
          )}

          <TouchableOpacity
            style={styles.favBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => toggleFavorite(app.id)}
          >
            <Star
              size={18}
              color={fav ? '#FBBF24' : colors.textMuted}
              fill={fav ? '#FBBF24' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>
            {app.name}
          </Text>
          <Text style={[styles.appVersion, { color: colors.textMuted }]}>
            v{app.version}
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: app.accentColor }]}>
          {app.subtitle}
        </Text>

        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {app.description}
        </Text>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.categoryPill}>
          <Text style={[styles.categoryText, { color: colors.textMuted }]}>
            #{app.category.toUpperCase()}
          </Text>
        </View>

        <View style={styles.openAction}>
          <Text style={[styles.openActionText, { color: app.accentColor }]}>
            Abrir App
          </Text>
          <ChevronRight size={16} color={app.accentColor} />
        </View>
      </View>
    </HtzCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favBtn: {
    padding: 4,
  },
  body: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  openAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  openActionText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
