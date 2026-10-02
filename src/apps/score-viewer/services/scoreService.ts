import { Match, SportCategory, MatchStatus } from './types';

// Mock realista enriquecido para cuando las APIs no tengan partidos en este instante o no haya token
const FALLBACK_MATCHES: Match[] = [
  {
    id: 'fb-1',
    game: 'FÚTBOL',
    league: 'LaLiga EA Sports',
    status: 'LIVE',
    timeInfo: "78'",
    startTimeIso: new Date().toISOString(),
    teamA: {
      name: 'Real Madrid',
      shortName: 'RMA',
      score: 2,
      logo: 'https://crests.football-data.org/86.png',
    },
    teamB: {
      name: 'Real Sociedad',
      shortName: 'RSO',
      score: 1,
      logo: 'https://crests.football-data.org/92.png',
    },
    details: {
      venue: 'Estadio Santiago Bernabéu, Madrid',
      tournamentStage: 'Jornada 28',
      headToHead: 'Últimos 5: 3V Real Madrid, 1E, 1V Real Sociedad',
    },
  },
  {
    id: 'fb-2',
    game: 'VALORANT',
    league: 'VCT EMEA Masters',
    status: 'LIVE',
    timeInfo: 'Mapa 2 [11-9]',
    startTimeIso: new Date().toISOString(),
    teamA: {
      name: 'Movistar KOI',
      shortName: 'KOI',
      score: 1,
      logo: 'https://images.seeklogo.com/logo-png/43/1/koi-logo-png_seeklogo-434032.png',
    },
    teamB: {
      name: 'Fnatic',
      shortName: 'FNC',
      score: 0,
      logo: 'https://images.seeklogo.com/logo-png/38/1/fnatic-logo-png_seeklogo-385012.png',
    },
    details: {
      tournamentStage: 'Semifinal Lower Bracket',
      roundOrMap: 'Mapa 1 (Bind): KOI 13-11. Mapa 2 (Ascent): KOI 11-9',
      bestOf: 3,
    },
  },
  {
    id: 'fb-3',
    game: 'LOL',
    league: 'LEC Season Finals',
    status: 'LIVE',
    timeInfo: 'Juego 3 (24m)',
    startTimeIso: new Date().toISOString(),
    teamA: {
      name: 'G2 Esports',
      shortName: 'G2',
      score: 1,
      logo: 'https://images.seeklogo.com/logo-png/38/1/g2-esports-logo-png_seeklogo-385013.png',
    },
    teamB: {
      name: 'Team Heretics',
      shortName: 'TH',
      score: 1,
      logo: 'https://images.seeklogo.com/logo-png/43/1/team-heretics-logo-png_seeklogo-434101.png',
    },
    details: {
      tournamentStage: 'Gran Final',
      roundOrMap: 'Juego 1: G2 (32m) | Juego 2: TH (28m)',
      bestOf: 5,
    },
  },
  {
    id: 'fb-4',
    game: 'R6',
    league: 'Europe League Stage 2',
    status: 'FINISHED',
    timeInfo: '7 - 5',
    startTimeIso: new Date(Date.now() - 3600000 * 2).toISOString(),
    teamA: {
      name: 'Team Secret',
      shortName: 'SEC',
      score: 5,
    },
    teamB: {
      name: 'BDS Esport',
      shortName: 'BDS',
      score: 7,
    },
    details: {
      tournamentStage: 'Fase Regular - Ronda 7',
      roundOrMap: 'Clubhouse (7-5)',
    },
  },
  {
    id: 'fb-5',
    game: 'FÚTBOL',
    league: 'Champions League',
    status: 'UPCOMING',
    timeInfo: '21:00h',
    startTimeIso: new Date(Date.now() + 3600000 * 3).toISOString(),
    teamA: {
      name: 'Barcelona',
      shortName: 'BAR',
      score: '-',
      logo: 'https://crests.football-data.org/81.png',
    },
    teamB: {
      name: 'Bayern Munich',
      shortName: 'BAY',
      score: '-',
      logo: 'https://crests.football-data.org/5.png',
    },
    details: {
      venue: 'Estadi Olímpic Lluís Companys, Barcelona',
      tournamentStage: 'Fase de Liga - Jornada 3',
      headToHead: 'Histórico Champions League',
    },
  },
  {
    id: 'fb-6',
    game: 'CS2',
    league: 'ESL Pro League',
    status: 'FINISHED',
    timeInfo: '2 - 0',
    startTimeIso: new Date(Date.now() - 3600000 * 5).toISOString(),
    teamA: {
      name: 'Natus Vincere',
      shortName: 'NAVI',
      score: 2,
    },
    teamB: {
      name: 'FaZe Clan',
      shortName: 'FAZE',
      score: 0,
    },
    details: {
      tournamentStage: 'Cuartos de Final',
      roundOrMap: 'Mirage: 13-9 | Nuke: 13-11',
      bestOf: 3,
    },
  },
  {
    id: 'fb-7',
    game: 'FÚTBOL',
    league: 'LaLiga Hypermotion',
    status: 'FINISHED',
    timeInfo: '1 - 0',
    startTimeIso: new Date(Date.now() - 3600000 * 4).toISOString(),
    teamA: {
      name: 'Eibar',
      shortName: 'EIB',
      score: 1,
      logo: 'https://crests.football-data.org/278.png',
    },
    teamB: {
      name: 'Mirandes',
      shortName: 'MIR',
      score: 0,
      logo: 'https://crests.football-data.org/299.png',
    },
    details: {
      venue: 'Estadio Municipal de Ipurua, Eibar',
      tournamentStage: 'Jornada 12',
    },
  },
];

function isTeamFavorite(teamName: string, shortName: string, favList: string[]): boolean {
  if (!favList || favList.length === 0) return false;
  const tn = (teamName || '').toLowerCase().trim();
  const sn = (shortName || '').toLowerCase().trim();
  return favList.some((fav) => {
    const f = fav.toLowerCase().trim();
    if (!f) return false;
    return tn.includes(f) || f.includes(tn) || (sn && sn === f);
  });
}

export const ScoreService = {
  async fetchAllMatches(config: {
    pandaToken?: string;
    footballToken?: string;
    favoriteTeams: string[];
    enabledGames: Record<string, boolean>;
  }): Promise<Match[]> {
    let combined: Match[] = [];

    // 1. Fetch PandaScore (Esports) si hay token
    if (config.pandaToken && config.pandaToken.trim().length > 10) {
      try {
        const pandaMatches = await this.fetchPandaScore(config.pandaToken);
        if (pandaMatches.length > 0) {
          combined = [...combined, ...pandaMatches];
        }
      } catch (err) {
        console.warn('PandaScore API error, usando fallback:', err);
      }
    }

    // 2. Fetch Football-Data (Fútbol) si hay token
    if (config.footballToken && config.footballToken.trim().length > 10) {
      try {
        const footballMatches = await this.fetchFootball(config.footballToken);
        if (footballMatches.length > 0) {
          combined = [...combined, ...footballMatches];
        }
      } catch (err) {
        console.warn('Football-Data API error, usando fallback:', err);
      }
    }

    // 3. Si no hay suficientes partidos de las APIs reales, completar con datos enriquecidos
    if (combined.length === 0) {
      combined = [...FALLBACK_MATCHES];
    } else {
      // Aseguramos tener partidos de demostración si las APIs sólo devolvieron pocos
      const existingGames = new Set(combined.map((m) => m.game));
      FALLBACK_MATCHES.forEach((fb) => {
        if (!existingGames.has(fb.game)) {
          combined.push(fb);
        }
      });
    }

    // 4. Marcar favoritos y ordenar con favoritos al principio
    const tagged = combined.map((m) => {
      const isFavA = isTeamFavorite(m.teamA.name, m.teamA.shortName, config.favoriteTeams);
      const isFavB = isTeamFavorite(m.teamB.name, m.teamB.shortName, config.favoriteTeams);
      const hasFav = isFavA || isFavB;
      return {
        ...m,
        teamA: { ...m.teamA, isFav: isFavA },
        teamB: { ...m.teamB, isFav: isFavB },
        hasFav,
      };
    });

    // Orden: Partidos en vivo primero, luego favoritos, luego fecha
    tagged.sort((a, b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (b.status === 'LIVE' && a.status !== 'LIVE') return 1;
      if (a.hasFav && !b.hasFav) return -1;
      if (!a.hasFav && b.hasFav) return 1;
      return 0;
    });

    return tagged;
  },

  async fetchPandaScore(token: string): Promise<Match[]> {
    const url = 'https://api.pandascore.co/matches?filter[status]=running,upcoming,finished&sort=-begin_at&per_page=20';
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error(`PandaScore HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const videoGame = (item.videogame && item.videogame.slug) || '';
      let category: SportCategory = 'VALORANT';
      if (videoGame.includes('league-of-legends')) category = 'LOL';
      else if (videoGame.includes('cs')) category = 'CS2';
      else if (videoGame.includes('rainbow-six') || videoGame.includes('r6')) category = 'R6';
      else if (videoGame.includes('dota')) category = 'DOTA2';

      let status: MatchStatus = 'UPCOMING';
      if (item.status === 'running') status = 'LIVE';
      else if (item.status === 'finished') status = 'FINISHED';

      const opponents = item.opponents || [];
      const oppA = opponents[0]?.opponent || {};
      const oppB = opponents[1]?.opponent || {};

      const results = item.results || [];
      const scoreA = results[0]?.score ?? (status === 'UPCOMING' ? '-' : 0);
      const scoreB = results[1]?.score ?? (status === 'UPCOMING' ? '-' : 0);

      let timeInfo = status === 'LIVE' ? 'En Vivo' : status === 'FINISHED' ? 'Final' : 'Próx';
      if (item.begin_at) {
        const d = new Date(item.begin_at);
        const hh = d.getHours().toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');
        timeInfo = `${hh}:${mm}h`;
      }

      return {
        id: `panda-${item.id}`,
        game: category,
        league: item.league?.name || item.tournament?.name || 'Esports Tournament',
        status,
        timeInfo: status === 'LIVE' ? `Directo (${scoreA}-${scoreB})` : timeInfo,
        startTimeIso: item.begin_at || new Date().toISOString(),
        teamA: {
          name: oppA.name || 'TBD',
          shortName: oppA.acronym || oppA.name?.slice(0, 4) || 'TBD',
          score: scoreA,
          logo: oppA.image_url || undefined,
        },
        teamB: {
          name: oppB.name || 'TBD',
          shortName: oppB.acronym || oppB.name?.slice(0, 4) || 'TBD',
          score: scoreB,
          logo: oppB.image_url || undefined,
        },
        details: {
          tournamentStage: item.tournament?.name,
          bestOf: item.number_of_games,
        },
      };
    });
  },

  async fetchFootball(token: string): Promise<Match[]> {
    const url = 'https://api.football-data.org/v4/matches';
    const res = await fetch(url, {
      headers: {
        'X-Auth-Token': token,
      },
    });

    if (!res.ok) throw new Error(`Football-Data HTTP ${res.status}`);
    const data = await res.json();
    const matches = data.matches || [];

    return matches.map((m: any) => {
      let status: MatchStatus = 'UPCOMING';
      if (m.status === 'IN_PLAY' || m.status === 'PAUSED') status = 'LIVE';
      else if (m.status === 'FINISHED') status = 'FINISHED';

      let timeInfo = 'Próx';
      if (status === 'LIVE') {
        timeInfo = m.minute ? `${m.minute}'` : 'En Juego';
      } else if (status === 'FINISHED') {
        timeInfo = 'Final';
      } else if (m.utcDate) {
        const d = new Date(m.utcDate);
        timeInfo = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}h`;
      }

      return {
        id: `foot-${m.id}`,
        game: 'FÚTBOL' as SportCategory,
        league: m.competition?.name || 'Fútbol',
        status,
        timeInfo,
        startTimeIso: m.utcDate || new Date().toISOString(),
        teamA: {
          name: m.homeTeam?.name || 'Local',
          shortName: m.homeTeam?.tla || m.homeTeam?.shortName || 'LOC',
          score: m.score?.fullTime?.home ?? (status === 'UPCOMING' ? '-' : 0),
          logo: m.homeTeam?.crest,
        },
        teamB: {
          name: m.awayTeam?.name || 'Visitante',
          shortName: m.awayTeam?.tla || m.awayTeam?.shortName || 'VIS',
          score: m.score?.fullTime?.away ?? (status === 'UPCOMING' ? '-' : 0),
          logo: m.awayTeam?.crest,
        },
        details: {
          tournamentStage: `Jornada ${m.matchday || 1}`,
        },
      };
    });
  },
};
