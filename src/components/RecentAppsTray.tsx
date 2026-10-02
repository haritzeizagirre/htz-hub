import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trophy, Terminal, Wrench, Activity, Layers, History } from 'lucide-react-native';
import { IntegratedAppManifest } from '../types';
import { useHub } from '../context/HubContext';

interface RecentAppsTrayProps {
  onSelectApp: (appId: string) => void;
}

const renderTrayIcon = (iconName: string, color: string) => {
  switch (iconName) {
    case 'Trophy':
      return <Trophy size={20} color={color} />;
    case 'Terminal':
      return <Terminal size={20} color={color} />;
    case 'Wrench':
      return <Wrench size={20} color={color} />;
    default:
      return <Layers size={20} color={color} />;
  }
};

export const RecentAppsTray: React.FC<RecentAppsTrayProps> = ({ onSelectApp }) => {
  const { colors, recentApps } = useHub();

  if (recentApps.length === 0) return null;

  return (
    <View style={[styles.container, { borderBottomColor: colors.borderSubtle }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <History size={14} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>
            Usadas Recientemente
          </Text>
        </View>
        <Text style={[styles.countText, { color: colors.textMuted }]}>
          {recentApps.length} {recentApps.length === 1 ? 'app' : 'apps'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {recentApps.map((app) => (
          <TouchableOpacity
            key={app.id}
            activeOpacity={0.7}
            style={styles.item}
            onPress={() => onSelectApp(app.id)}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: `${app.accentColor}20`,
                  borderColor: `${app.accentColor}40`,
                },
              ]}
            >
              {renderTrayIcon(app.icon, app.accentColor)}
            </View>
            <Text
              style={[styles.appName, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {app.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  countText: {
    fontSize: 11,
  },
  scroll: {
    paddingHorizontal: 16,
    gap: 16,
  },
  item: {
    alignItems: 'center',
    width: 64,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 6,
  },
  appName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
