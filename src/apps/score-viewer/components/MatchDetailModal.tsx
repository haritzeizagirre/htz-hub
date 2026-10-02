import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  X,
  Trophy,
  MapPin,
  Calendar,
  Layers,
  History,
  Star,
  Flame,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { Match } from '../services/types';
import {
  HtzCard,
  HtzBadge,
} from '../../../components/htz';
import { htzTokens } from '../../../components/htz/tokens';

interface MatchDetailModalProps {
  match: Match | null;
  visible: boolean;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  match,
  visible,
  onClose,
}) => {
  if (!match) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.leagueTag}>
              <Trophy size={15} color={htzTokens.colors.primary} />
              <Text style={styles.leagueTitle}>{match.league}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={20} color={htzTokens.colors.outline} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Status Banner using HtzBadge */}
            <View style={styles.statusBanner}>
              {match.status === 'LIVE' && (
                <HtzBadge
                  variant="error"
                  icon={<Flame size={13} color="#FFFFFF" />}
                  label={`EN DIRECTO (${match.timeInfo})`}
                />
              )}
              {match.status === 'FINISHED' && (
                <HtzBadge
                  variant="success"
                  icon={<CheckCircle size={13} color="#FFFFFF" />}
                  label={`FINALIZADO (${match.timeInfo})`}
                />
              )}
              {match.status === 'UPCOMING' && (
                <HtzBadge
                  variant="primary"
                  icon={<Clock size={13} color="#FFFFFF" />}
                  label={`PRÓXIMO (${match.timeInfo})`}
                />
              )}
            </View>

            {/* Scoreboard Big Card */}
            <HtzCard style={styles.scoreboard}>
              {/* Team A */}
              <View style={styles.teamBox}>
                <View style={styles.logoCircle}>
                  {match.teamA.logo ? (
                    <Image source={{ uri: match.teamA.logo }} style={styles.bigLogo} />
                  ) : (
                    <Text style={styles.bigFallback}>{match.teamA.shortName}</Text>
                  )}
                </View>
                <View style={styles.teamNameRow}>
                  {match.teamA.isFav && <Star size={14} color="#FBBF24" fill="#FBBF24" />}
                  <Text style={styles.bigTeamName} numberOfLines={2}>
                    {match.teamA.name}
                  </Text>
                </View>
              </View>

              {/* Score Center */}
              <View style={styles.scoreCenter}>
                <Text style={styles.bigScore}>
                  {match.teamA.score} - {match.teamB.score}
                </Text>
                {match.details?.bestOf && (
                  <Text style={styles.bestOfText}>Al mejor de {match.details.bestOf} (BO{match.details.bestOf})</Text>
                )}
              </View>

              {/* Team B */}
              <View style={styles.teamBox}>
                <View style={styles.logoCircle}>
                  {match.teamB.logo ? (
                    <Image source={{ uri: match.teamB.logo }} style={styles.bigLogo} />
                  ) : (
                    <Text style={styles.bigFallback}>{match.teamB.shortName}</Text>
                  )}
                </View>
                <View style={styles.teamNameRow}>
                  <Text style={styles.bigTeamName} numberOfLines={2}>
                    {match.teamB.name}
                  </Text>
                  {match.teamB.isFav && <Star size={14} color="#FBBF24" fill="#FBBF24" />}
                </View>
              </View>
            </HtzCard>

            {/* Match Information Details */}
            <Text style={styles.sectionHeader}>Detalles del Enfrentamiento</Text>
            <HtzCard style={styles.detailsBlock}>
              <View style={styles.detailItem}>
                <Calendar size={16} color={htzTokens.colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.detailLabel}>Competición & Fase</Text>
                  <Text style={styles.detailValue}>
                    {match.league} {match.details?.tournamentStage ? `• ${match.details.tournamentStage}` : ''}
                  </Text>
                </View>
              </View>

              {match.details?.venue && (
                <View style={[styles.detailItem, { borderTopWidth: 1, borderTopColor: htzTokens.colors.outline }]}>
                  <MapPin size={16} color={htzTokens.colors.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.detailLabel}>Estadio / Lugar</Text>
                    <Text style={styles.detailValue}>{match.details.venue}</Text>
                  </View>
                </View>
              )}

              {match.details?.roundOrMap && (
                <View style={[styles.detailItem, { borderTopWidth: 1, borderTopColor: htzTokens.colors.outline }]}>
                  <Layers size={16} color={htzTokens.colors.secondary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.detailLabel}>Desglose de Mapas / Rondas</Text>
                    <Text style={styles.detailValue}>{match.details.roundOrMap}</Text>
                  </View>
                </View>
              )}

              {match.details?.headToHead && (
                <View style={[styles.detailItem, { borderTopWidth: 1, borderTopColor: htzTokens.colors.outline }]}>
                  <History size={16} color="#FBBF24" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.detailLabel}>Historial / Head to Head</Text>
                    <Text style={styles.detailValue}>{match.details.headToHead}</Text>
                  </View>
                </View>
              )}
            </HtzCard>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: htzTokens.colors.surfaceVariant,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: htzTokens.colors.outline,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: htzTokens.colors.outline,
  },
  leagueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leagueTitle: {
    color: htzTokens.colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  statusBanner: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreboard: {
    backgroundColor: htzTokens.colors.surface,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderColor: htzTokens.colors.outline,
  },
  teamBox: {
    flex: 1,
    alignItems: 'center',
  },
  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: htzTokens.colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  bigLogo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
  },
  bigFallback: {
    color: htzTokens.colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
  },
  teamNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bigTeamName: {
    color: htzTokens.colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  scoreCenter: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  bigScore: {
    color: htzTokens.colors.onSurface,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  bestOfText: {
    color: htzTokens.colors.outline,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHeader: {
    color: htzTokens.colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  detailsBlock: {
    backgroundColor: htzTokens.colors.surface,
    borderColor: htzTokens.colors.outline,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  detailLabel: {
    color: htzTokens.colors.outline,
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    color: htzTokens.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
});
