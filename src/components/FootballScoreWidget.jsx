import React, { useEffect, useMemo, useState } from 'react';
import '../assets/styles/FootballScoreWidget.css';

const SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';
const REFRESH_MS = 30000;
const UPCOMING_DAYS = 10;

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const getScoreboardUrl = () => {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + UPCOMING_DAYS);
  return `${SCOREBOARD_URL}?dates=${toDateKey(start)}-${toDateKey(end)}&limit=100`;
};

const formatMatchTime = (dateValue) => {
  if (!dateValue) return '';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const getTeam = (competition, homeAway) =>
  competition?.competitors?.find((competitor) => competitor.homeAway === homeAway);

const normalizeMatch = (event) => {
  const competition = event?.competitions?.[0];
  const status = competition?.status || event?.status;
  const home = getTeam(competition, 'home');
  const away = getTeam(competition, 'away');

  if (!competition || !status || !home || !away) return null;

  return {
    id: event.id,
    name: event.shortName || event.name || 'FIFA World Cup',
    note: competition.altGameNote || event.season?.slug || 'FIFA World Cup',
    date: competition.date || event.date,
    state: status.type?.state || '',
    statusText: status.type?.shortDetail || status.displayClock || 'Live',
    clock: status.displayClock || status.type?.detail || '',
    startTime: formatMatchTime(competition.date || event.date),
    venue: competition.venue?.fullName || '',
    home: {
      name: home.team?.shortDisplayName || home.team?.displayName || home.team?.abbreviation || 'Home',
      abbreviation: home.team?.abbreviation || '',
      score: home.score ?? '',
      logo: home.team?.logo || '',
    },
    away: {
      name: away.team?.shortDisplayName || away.team?.displayName || away.team?.abbreviation || 'Away',
      abbreviation: away.team?.abbreviation || '',
      score: away.score ?? '',
      logo: away.team?.logo || '',
    },
  };
};

const isLiveWorldCupMatch = (event) => {
  const competition = event?.competitions?.[0];
  const status = competition?.status || event?.status;
  return status?.type?.state === 'in' && !status?.type?.completed;
};

const isUpcomingWorldCupMatch = (event) => {
  const competition = event?.competitions?.[0];
  const status = competition?.status || event?.status;
  const kickoff = new Date(competition?.date || event?.date).getTime();
  return status?.type?.state === 'pre' && Number.isFinite(kickoff) && kickoff >= Date.now();
};

const TeamRow = ({ team, showScore }) => (
  <div className={`football-score-team ${showScore ? '' : 'is-upcoming'}`}>
    {team.logo ? (
      <img src={team.logo} alt="" className="football-score-logo" loading="lazy" />
    ) : (
      <span className="football-score-logo football-score-logo-fallback">{team.abbreviation.slice(0, 2)}</span>
    )}
    <span className="football-score-team-name">{team.name}</span>
    {showScore && <strong className="football-score-value">{team.score || '0'}</strong>}
  </div>
);

const FootballScoreWidget = () => {
  const [matches, setMatches] = useState([]);
  const [mode, setMode] = useState('live');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    let mounted = true;
    let refreshTimer;

    const loadScores = async () => {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(getScoreboardUrl(), {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) throw new Error(`Scoreboard request failed: ${response.status}`);

        const data = await response.json();
        const liveMatches = (data.events || [])
          .filter(isLiveWorldCupMatch)
          .map(normalizeMatch)
          .filter(Boolean);
        const upcomingMatches = (data.events || [])
          .filter(isUpcomingWorldCupMatch)
          .map(normalizeMatch)
          .filter(Boolean)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const nextMatches = liveMatches.length ? liveMatches : upcomingMatches.slice(0, 3);

        if (mounted) {
          setMatches(nextMatches);
          setMode(liveMatches.length ? 'live' : 'upcoming');
          setActiveIndex((index) => (nextMatches.length ? index % nextMatches.length : 0));
        }
      } catch (error) {
        if (mounted && error.name !== 'AbortError') {
          setMatches([]);
          setMode('live');
          setActiveIndex(0);
        }
      } finally {
        window.clearTimeout(timeout);
      }
    };

    loadScores();
    refreshTimer = window.setInterval(loadScores, REFRESH_MS);

    return () => {
      mounted = false;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (matches.length <= 1) return undefined;
    const rotateTimer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % matches.length);
    }, 8000);

    return () => window.clearInterval(rotateTimer);
  }, [matches.length]);

  const match = useMemo(() => matches[activeIndex], [matches, activeIndex]);
  const isLive = mode === 'live';

  if (!match) return null;

  if (isMinimized) {
    return (
      <button
        type="button"
        className="football-score-widget football-score-minimized"
        onClick={() => setIsMinimized(false)}
        aria-label="Show FIFA World Cup score"
      >
        <span className={`football-score-live-dot ${isLive ? '' : 'is-upcoming'}`} aria-hidden="true" />
        <span>{isLive ? 'Live Score' : 'Next Match'}</span>
      </button>
    );
  }

  return (
    <aside className="football-score-widget" aria-label={isLive ? 'Live FIFA World Cup score' : 'Upcoming FIFA World Cup match'}>
      <div className="football-score-header">
        <span className={`football-score-live-dot ${isLive ? '' : 'is-upcoming'}`} aria-hidden="true" />
        <span>{isLive ? 'FIFA World Cup Live' : 'Next FIFA World Cup'}</span>
        <span className="football-score-time">{isLive ? match.clock || match.statusText : match.startTime || match.statusText}</span>
        <button
          type="button"
          className="football-score-minimize-btn"
          onClick={() => setIsMinimized(true)}
          aria-label="Minimize FIFA World Cup score"
          title="Minimize"
        >
          -
        </button>
      </div>

      <div className="football-score-body">
        <TeamRow team={match.home} showScore={isLive} />
        {!isLive && <div className="football-score-versus">vs</div>}
        <TeamRow team={match.away} showScore={isLive} />
      </div>

      <div className="football-score-footer">
        <span>{isLive ? match.statusText : match.note}</span>
        {matches.length > 1 && <span>{activeIndex + 1}/{matches.length}</span>}
      </div>
    </aside>
  );
};

export default FootballScoreWidget;
