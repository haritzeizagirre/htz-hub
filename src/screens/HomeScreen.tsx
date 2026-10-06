import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useHub } from '../context/HubContext';
import { AppHeader } from '../components/AppHeader';
import { RecentAppsTray } from '../components/RecentAppsTray';
import { CategoryFilter } from '../components/CategoryFilter';
import { AppCard } from '../components/AppCard';
import { AppRegistry } from '../apps/registry';
import { AppCategory } from '../types';
import { SearchX } from 'lucide-react-native';

export const HomeScreen: React.FC = () => {
  const { colors, launchApp, catalog } = useHub();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('todas');

  const apps = AppRegistry.filter(searchQuery, selectedCategory, catalog);
  const totalAppsCount = AppRegistry.getAll(catalog).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        appCount={totalAppsCount}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* WeChat Recent Apps Tray */}
        <RecentAppsTray onSelectApp={(id) => launchApp(id)} />

        {/* Category Filter Pills */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Apps List */}
        <View style={styles.appsList}>
          {apps.length > 0 ? (
            apps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onPress={() => launchApp(app.id)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <SearchX size={44} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No se encontraron aplicaciones
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Prueba con otro término de búsqueda o selecciona otra categoría.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  appsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
