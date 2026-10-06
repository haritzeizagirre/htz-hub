import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Star, Sparkles } from 'lucide-react-native';
import { useHub } from '../context/HubContext';
import { AppRegistry } from '../apps/registry';
import { AppCard } from '../components/AppCard';

export const FavoritesScreen: React.FC = () => {
  const { colors, favorites, launchApp, catalog } = useHub();
  const favApps = AppRegistry.getFavorites(favorites, catalog);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
        <View style={styles.headerTitleRow}>
          <Star size={22} color="#FBBF24" fill="#FBBF24" />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Aplicaciones Favoritas
          </Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Tus aplicaciones fijadas para un acceso más rápido
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {favApps.length > 0 ? (
          favApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onPress={() => launchApp(app.id)}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
              <Star size={36} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Sin favoritas todavía
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Pulsa en el icono de estrella de cualquier aplicación para fijarla aquí.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
