import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Search, X, Grid, SlidersHorizontal, Sparkles } from 'lucide-react-native';
import { useHub } from '../context/HubContext';

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  appCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  searchQuery,
  onSearchChange,
  appCount,
}) => {
  const { colors } = useHub();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Grid size={18} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                Hub Móvil
              </Text>
              <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {appCount} {appCount === 1 ? 'aplicación disponible' : 'aplicaciones disponibles'}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar aplicación o función..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
});
