export type SportCategory =
  | 'FÚTBOL'
  | 'VALORANT'
  | 'LOL'
  | 'CS2'
  | 'R6'
  | 'DOTA2';

export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED';

export interface MatchTeam {
  name: string;
  shortName: string;
  score: number | string;
  logo?: string;
  isFav?: boolean;
}

export interface Match {
  id: string;
  game: SportCategory;
  league: string;
  status: MatchStatus;
  timeInfo: string;
  startTimeIso: string;
  teamA: MatchTeam;
  teamB: MatchTeam;
  details?: {
    venue?: string;
    tournamentStage?: string;
    roundOrMap?: string;
    headToHead?: string;
    bestOf?: number;
  };
}

export interface Gtr3ConfigState {
  pandaToken: string;
  footballToken: string;
  enabledGames: Record<string, boolean>;
  favoriteTeams: string[];
  favoriteTournaments: string[];
  showUpcoming: boolean;
  showFavoriteRecentResults: boolean;
  showTeamLogos: boolean;
  maxMatches: number;
}
