import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Star, Flame, Clock, CheckCircle } from 'lucide-react-native';
import { Match, SportCategory } from '../services/types';
import { HtzCard, HtzBadge, HtzChip, htzTokens } from '../../../components/htz';

interface MatchCardProps {
  match: Match;
  onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const [imgErrorA, setImgErrorA] = useState(false);
  const [imgErrorB, setImgErrorB] = useState(false);

  const hasFavorite = match.teamA.isFav || match.teamB.isFav;

  // Determine which team is winning (for highlighting score)
  const numScoreA = typeof match.teamA.score === 'number' ? match.teamA.score : parseInt(String(match.teamA.score), 10);
  const numScoreB = typeof match.teamB.score === 'number' ? match.teamB.score : parseInt(String(match.teamB.score), 10);
  const isAWinning = !isNaN(numScoreA) && !isNaN(numScoreB) && numScoreA > numScoreB;
  const isBWinning = !isNaN(numScoreA) && !isNaN(numScoreB) && numScoreB > numScoreA;

  return (
    <HtzCard
      elevated
      onPress={onPress}
      style={[
        styles.card,
        hasFavorite && styles.favCardBorder,
      ]}
    >
      {/* Header of Match Card */}
      <View style={styles.header}>
        <View style={styles.leagueRow}>
          <HtzChip
            label={match.game}
            variant="primary"
            style={styles.chipTag}
          />
          <Text style={styles.leagueName} numberOfLines={1}>
            {match.league}
          </Text>
        </View>

        {/* Status Badge using HtzBadge */}
        {match.status === 'LIVE' && (
          <HtzBadge variant="error" dot label={match.timeInfo} />
        )}
        {match.status === 'FINISHED' && (
          <HtzBadge variant="success" label={match.timeInfo} />
        )}
        {match.status === 'UPCOMING' && (
          <HtzBadge variant="secondary" label={match.timeInfo} />
        )}
      </View>

      {/* Teams List (Vertical Stack - Clean 2-Row Format) */}
      <View style={styles.teamsListContainer}>
        {/* Team A Row */}
        <View style={styles.teamRow}>
          <View style={styles.teamLeft}>
            <View style={styles.teamLogoWrapper}>
              {match.teamA.logo && !imgErrorA ? (
                <Image
                  source={{ uri: match.teamA.logo }}
                  style={styles.teamLogo}
                  onError={() => setImgErrorA(true)}
                />
              ) : (
                <View style={[styles.logoFallback, { backgroundColor: '#1E293B' }]}>
                  <Text style={styles.fallbackText}>{match.teamA.shortName.slice(0, 3)}</Text>
                </View>
              )}
            </View>

            <View style={styles.nameBlock}>
              <View style={styles.nameAndFav}>
                {match.teamA.isFav && (
                  <Star size={13} color="#FBBF24" fill="#FBBF24" style={{ marginRight: 5 }} />
                )}
                <Text
                  style={[
                    styles.teamName,
                    isAWinning && styles.winningTeamName,
                  ]}
                  numberOfLines={1}
                >
                  {match.teamA.name}
                </Text>
              </View>
              <Text style={styles.shortText}>{match.teamA.shortName}</Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <Text
              style={[
                styles.scoreNumber,
                isAWinning && styles.winningScore,
                match.status === 'UPCOMING' && styles.upcomingScore,
              ]}
            >
              {match.teamA.score}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.teamDivider} />

        {/* Team B Row */}
        <View style={styles.teamRow}>
          <View style={styles.teamLeft}>
            <View style={styles.teamLogoWrapper}>
              {match.teamB.logo && !imgErrorB ? (
                <Image
                  source={{ uri: match.teamB.logo }}
                  style={styles.teamLogo}
                  onError={() => setImgErrorB(true)}
                />
              ) : (
                <View style={[styles.logoFallback, { backgroundColor: '#1E293B' }]}>
                  <Text style={styles.fallbackText}>{match.teamB.shortName.slice(0, 3)}</Text>
                </View>
              )}
            </View>

            <View style={styles.nameBlock}>
              <View style={styles.nameAndFav}>
                {match.teamB.isFav && (
                  <Star size={13} color="#FBBF24" fill="#FBBF24" style={{ marginRight: 5 }} />
                )}
                <Text
                  style={[
                    styles.teamName,
                    isBWinning && styles.winningTeamName,
                  ]}
                  numberOfLines={1}
                >
                  {match.teamB.name}
                </Text>
              </View>
              <Text style={styles.shortText}>{match.teamB.shortName}</Text>
            </View>
          </View>

          <View style={styles.scoreContainer}>
            <Text
              style={[
                styles.scoreNumber,
                isBWinning && styles.winningScore,
                match.status === 'UPCOMING' && styles.upcomingScore,
              ]}
            >
              {match.teamB.score}
            </Text>
          </View>
        </View>
      </View>

      {/* Match Subtitle / Stage */}
      {match.details?.tournamentStage && (
        <View style={styles.footerRow}>
          <Text style={styles.stageText}>{match.details.tournamentStage}</Text>
          {match.details.roundOrMap && (
            <Text style={styles.roundText}> • {match.details.roundOrMap}</Text>
          )}
        </View>
      )}
    </HtzCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  favCardBorder: {
    borderColor: 'rgba(251, 191, 36, 0.45)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  chipTag: {
    marginRight: 8,
    height: 24,
    paddingHorizontal: 8,
  },
  leagueName: {
    color: htzTokens.colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  teamsListContainer: {
    backgroundColor: htzTokens.colors.surfaceContainerLowest,
    borderRadius: htzTokens.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: htzTokens.colors.surfaceVariant,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  teamDivider: {
    height: 1,
    backgroundColor: htzTokens.colors.surfaceVariant,
  },
  teamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  teamLogoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  teamLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  logoFallback: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
  },
  nameBlock: {
    flex: 1,
  },
  nameAndFav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    color: htzTokens.colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  winningTeamName: {
    color: htzTokens.colors.onSurface,
    fontWeight: '800',
  },
  shortText: {
    color: htzTokens.colors.outline,
    fontSize: 10,
    fontWeight: '500',
  },
  scoreContainer: {
    minWidth: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scoreNumber: {
    color: htzTokens.colors.onSurfaceVariant,
    fontSize: 18,
    fontWeight: '700',
  },
  winningScore: {
    color: htzTokens.colors.onSurface,
    fontWeight: '900',
    fontSize: 20,
  },
  upcomingScore: {
    color: htzTokens.colors.outline,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: htzTokens.colors.surfaceVariant,
  },
  stageText: {
    color: htzTokens.colors.outline,
    fontSize: 11,
    fontWeight: '600',
  },
  roundText: {
    color: htzTokens.colors.onSurfaceVariant,
    fontSize: 11,
  },
});
