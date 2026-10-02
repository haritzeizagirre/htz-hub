import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Trophy,
  Radio,
  Watch,
  Star,
  Key,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react-native';
import { SubAppProps } from '../../types';
import { Match, MatchStatus, SportCategory, Gtr3ConfigState } from './services/types';
import { ScoreService } from './services/scoreService';
import { MatchCard } from './components/MatchCard';
import { MatchDetailModal } from './components/MatchDetailModal';
import { WatchCompanionView } from './components/WatchCompanionView';
import { FavoritesManagerView } from './components/FavoritesManagerView';
import {
  HtzTabs,
  HtzChip,
  HtzButton,
  HtzCard,
  HtzInput,
  htzTokens,
} from '../../components/htz';

type MainTab = 'scores' | 'favorites' | 'watch' | 'api';

const DEFAULT_ENABLED_GAMES = {
  football: true,
  valorant: true,
  lol: true,
  cs2: false,
  r6: true,
  dota2: false,
  rocket_league: false,
};

const DEFAULT_TEAMS = [
  'Real Madrid',
  'Barcelona',
  'Real Sociedad',
  'Athletic Club',
  'Eibar',
  'Mirandes',
  'Movistar KOI',
  'Fnatic',
  'G2 Esports',
  'Team Heretics',
  'Giantx',
];

const DEFAULT_TOURNAMENTS = [
  'LaLiga',
  'Champions League',
  'Premier League',
  'VCT',
  'LEC',
  'Six Invitational',
];

export const ScoreViewerApp: React.FC<SubAppProps> = ({ onExitToHub, storage }) => {
  const [activeTab, setActiveTab] = useState<MainTab>('scores');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Filters for Scores
  const [statusFilter, setStatusFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [sportFilter, setSportFilter] = useState<'TODOS' | SportCategory>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  // Watch Configuration state
  const [watchConfig, setWatchConfig] = useState<Gtr3ConfigState>({
    pandaToken: 'REMOVED_SECRET',
    footballToken: '',
    enabledGames: DEFAULT_ENABLED_GAMES,
    favoriteTeams: DEFAULT_TEAMS,
    favoriteTournaments: DEFAULT_TOURNAMENTS,
    showUpcoming: true,
    showFavoriteRecentResults: true,
    showTeamLogos: true,
    maxMatches: 15,
  });

  // Load persisted configuration
  useEffect(() => {
    (async () => {
      try {
        const storedConfig = await storage.get<Gtr3ConfigState>('watch_config');
        if (storedConfig) {
          setWatchConfig((prev) => ({ ...prev, ...storedConfig }));
        }
      } catch (err) {
        console.warn('Error loading storage:', err);
      }
    })();
  }, []);

  // Fetch matches
  const loadMatches = useCallback(async () => {
    try {
      const data = await ScoreService.fetchAllMatches({
        pandaToken: watchConfig.pandaToken,
        footballToken: watchConfig.footballToken,
        favoriteTeams: watchConfig.favoriteTeams,
        enabledGames: watchConfig.enabledGames,
      });
      setMatches(data);
    } catch (err) {
      console.warn('Error loading matches:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [watchConfig]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const handleUpdateConfig = async (newConfig: Gtr3ConfigState) => {
    setWatchConfig(newConfig);
    await storage.set('watch_config', newConfig);
  };

  const handleUpdateTeams = async (teams: string[]) => {
    const updated = { ...watchConfig, favoriteTeams: teams };
    setWatchConfig(updated);
    await storage.set('watch_config', updated);
  };

  const handleUpdateTournaments = async (tournaments: string[]) => {
    const updated = { ...watchConfig, favoriteTournaments: tournaments };
    setWatchConfig(updated);
    await storage.set('watch_config', updated);
  };

  // Filter matches
  const filteredMatches = matches.filter((m) => {
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    const matchesSport = sportFilter === 'TODOS' || m.game === sportFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      m.teamA.name.toLowerCase().includes(q) ||
      m.teamB.name.toLowerCase().includes(q) ||
      m.league.toLowerCase().includes(q);
    return matchesStatus && matchesSport && matchesQuery;
  });

  const liveMatchesCount = matches.filter((m) => m.status === 'LIVE').length;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <HtzButton
          variant="secondary"
          size="sm"
          icon={<ArrowLeft size={16} color={htzTokens.colors.onSurface} />}
          onPress={onExitToHub}
        >
          Hub
        </HtzButton>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.appTitle}>Score Viewer Pro</Text>
          <View style={styles.liveIndicatorRow}>
            {liveMatchesCount > 0 ? (
              <>
                <View style={styles.redDot} />
                <Text style={styles.liveCountText}>{liveMatchesCount} en directo</Text>
              </>
            ) : (
              <Text style={styles.idleCountText}>Resultados y Próximos</Text>
            )}
          </View>
        </View>

        <HtzButton
          variant="secondary"
          size="sm"
          onPress={onRefresh}
          disabled={refreshing}
          icon={
            refreshing ? (
              <ActivityIndicator size="small" color={htzTokens.colors.primary} />
            ) : (
              <RefreshCw size={15} color={htzTokens.colors.onSurface} />
            )
          }
        />
      </View>

      {/* Internal Navigation Tabs using HtzTabs */}
      <View style={styles.tabsWrapper}>
        <HtzTabs
          tabs={[
            { id: 'scores', label: 'Marcadores', icon: <Radio size={14} color={activeTab === 'scores' ? '#ffffff' : htzTokens.colors.outline} /> },
            { id: 'favorites', label: 'Favoritos', icon: <Star size={14} color={activeTab === 'favorites' ? '#ffffff' : htzTokens.colors.outline} /> },
            { id: 'watch', label: 'GTR 3', icon: <Watch size={14} color={activeTab === 'watch' ? '#ffffff' : htzTokens.colors.outline} /> },
            { id: 'api', label: 'APIs', icon: <Key size={14} color={activeTab === 'api' ? '#ffffff' : htzTokens.colors.outline} /> },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </View>

      {/* TAB CONTENT */}
      {activeTab === 'scores' && (
        <View style={styles.mainScoresContainer}>
          {/* Status Filter Bar using HtzChip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statusFilterScrollView}
            contentContainerStyle={styles.statusFiltersScroll}
          >
            {[
              { key: 'ALL', label: 'Todos' },
              { key: 'LIVE', label: `En Directo (${liveMatchesCount})` },
              { key: 'UPCOMING', label: 'Próximos' },
              { key: 'FINISHED', label: 'Finalizados' },
            ].map((f) => (
              <HtzChip
                key={f.key}
                label={f.label}
                selected={statusFilter === f.key}
                variant={f.key === 'LIVE' ? 'warning' : 'secondary'}
                onPress={() => setStatusFilter(f.key as any)}
              />
            ))}
          </ScrollView>

          {/* Sport Filter Pills using HtzChip */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sportFilterScrollView}
            contentContainerStyle={styles.sportFilterScroll}
          >
            {(['TODOS', 'FÚTBOL', 'VALORANT', 'LOL', 'CS2', 'R6'] as (
              | 'TODOS'
              | SportCategory
            )[]).map((sp) => (
              <HtzChip
                key={sp}
                label={sp}
                selected={sportFilter === sp}
                variant="primary"
                onPress={() => setSportFilter(sp)}
              />
            ))}
          </ScrollView>

          {/* Matches List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={htzTokens.colors.primary} />
              <Text style={styles.loadingText}>Cargando marcadores en vivo...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scoresList}
              contentContainerStyle={styles.scoresListContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={htzTokens.colors.primary}
                />
              }
            >
              {filteredMatches.length > 0 ? (
                filteredMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onPress={() => setSelectedMatch(m)}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Trophy size={42} color={htzTokens.colors.outline} />
                  <Text style={styles.emptyTitle}>No hay partidos en esta categoría</Text>
                  <Text style={styles.emptySubtitle}>
                    Prueba cambiando los filtros de estado o deporte arriba.
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* TAB 2: FAVORITOS */}
      {activeTab === 'favorites' && (
        <FavoritesManagerView
          favoriteTeams={watchConfig.favoriteTeams}
          favoriteTournaments={watchConfig.favoriteTournaments}
          onUpdateTeams={handleUpdateTeams}
          onUpdateTournaments={handleUpdateTournaments}
        />
      )}

      {/* TAB 3: AMAZFIT GTR 3 COMPANION */}
      {activeTab === 'watch' && (
        <WatchCompanionView
          config={watchConfig}
          onUpdateConfig={handleUpdateConfig}
        />
      )}

      {/* TAB 4: AJUSTES DE API */}
      {activeTab === 'api' && (
        <ScrollView style={styles.apiScroll} contentContainerStyle={styles.apiContent}>
          <Text style={styles.apiSectionTitle}>Configuración de Claves de API</Text>
          <Text style={styles.apiSectionDesc}>
            Score Viewer Pro utiliza estas claves tanto para alimentar la app móvil como para sincronizarlas con el reloj Amazfit GTR 3.
          </Text>

          <HtzCard elevated style={{ padding: 18 }}>
            <HtzInput
              label="Token PandaScore (Esports: LoL, Valorant, CS2, R6):"
              value={watchConfig.pandaToken}
              onChangeText={(val) => setWatchConfig({ ...watchConfig, pandaToken: val })}
              placeholder="Pega aquí tu token de PandaScore"
              secureTextEntry
            />
            <Text style={styles.apiHelp}>
              Obtén tu clave gratuita registrándote en pandascore.co (Plan Hobbyist).
            </Text>

            <View style={{ height: 14 }} />

            <HtzInput
              label="Token Football-Data.org (Fútbol: LaLiga, Champions):"
              value={watchConfig.footballToken}
              onChangeText={(val) => setWatchConfig({ ...watchConfig, footballToken: val })}
              placeholder="Opcional: Token de Football-Data"
            />
            <Text style={styles.apiHelp}>
              Obtén tu clave gratuita en football-data.org para marcadores oficiales de fútbol.
            </Text>

            <View style={{ height: 18 }} />

            <HtzButton
              variant="primary"
              size="md"
              icon={<CheckCircle2 size={18} color="#FFFFFF" />}
              onPress={async () => {
                await storage.set('watch_config', watchConfig);
                Alert.alert('Guardado', 'Claves de API guardadas correctamente.');
                loadMatches();
              }}
            >
              Guardar y Recargar Datos
            </HtzButton>
          </HtzCard>
        </ScrollView>
      )}

      {/* Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        visible={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: htzTokens.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: htzTokens.colors.surfaceVariant,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    color: htzTokens.colors.onSurface,
    fontSize: 17,
    fontWeight: '800',
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: htzTokens.colors.error,
  },
  liveCountText: {
    color: htzTokens.colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  idleCountText: {
    color: htzTokens.colors.outline,
    fontSize: 11,
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  mainScoresContainer: {
    flex: 1,
  },
  statusFilterScrollView: {
    height: 42,
    maxHeight: 42,
    flexGrow: 0,
    marginTop: 8,
    marginBottom: 4,
  },
  statusFiltersScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  sportFilterScrollView: {
    height: 42,
    maxHeight: 42,
    flexGrow: 0,
    marginBottom: 8,
  },
  sportFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  scoresList: {
    flex: 1,
  },
  scoresListContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: htzTokens.colors.outline,
    fontSize: 13,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: htzTokens.colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 4,
  },
  emptySubtitle: {
    color: htzTokens.colors.outline,
    fontSize: 13,
    textAlign: 'center',
  },
  apiScroll: {
    flex: 1,
  },
  apiContent: {
    padding: 18,
    paddingBottom: 40,
  },
  apiSectionTitle: {
    color: htzTokens.colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  apiSectionDesc: {
    color: htzTokens.colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  apiHelp: {
    color: htzTokens.colors.outline,
    fontSize: 11,
    marginTop: 4,
  },
});
