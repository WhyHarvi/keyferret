import "server-only";
import type { Game } from "@/lib/types";

const GAME_FIELDS = `id,slug,name,summary,storyline,cover.image_id,artworks.image_id,artworks.width,artworks.height,screenshots.image_id,screenshots.width,screenshots.height,videos.name,videos.video_id,first_release_date,genres.name,platforms.name,rating,themes.name,game_modes.name,player_perspectives.name,game_engines.name,franchises.name`;

type IGDBImage = { image_id?: string; width?: number; height?: number };
type NamedIGDBEntity = { name: string };
type IGDBGame = { id: number; slug?: string; name: string; summary?: string; storyline?: string; cover?: IGDBImage; artworks?: IGDBImage[]; screenshots?: IGDBImage[]; videos?: Array<{ name?: string; video_id?: string }>; first_release_date?: number; genres?: NamedIGDBEntity[]; platforms?: NamedIGDBEntity[]; rating?: number; themes?: NamedIGDBEntity[]; game_modes?: NamedIGDBEntity[]; player_perspectives?: NamedIGDBEntity[]; game_engines?: NamedIGDBEntity[]; franchises?: NamedIGDBEntity[] };
let cachedToken: { value: string; expiresAt: number; clientId: string } | null = null;

export async function getIGDBAccessToken(forceRefresh = false): Promise<string> {
  const clientId = process.env.IGDB_CLIENT_ID?.trim();
  const clientSecret = process.env.IGDB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error("Missing IGDB credentials in .env.local");
  if (!forceRefresh && cachedToken?.clientId === clientId && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const params = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" });
  const response = await fetch(`https://id.twitch.tv/oauth2/token?${params}`, { method: "POST", cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to get IGDB token (${response.status}): ${await response.text()}`);
  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000, clientId };
  return data.access_token;
}

async function requestGames(body: string, cacheSeconds?: number): Promise<Game[]> {
  return ((await requestIGDB("games", body, cacheSeconds)) as IGDBGame[]).map(toGame);
}

// IGDB throttles hard (a few requests/second) and the same catalog queries
// (popular games, a given slug) get re-issued on nearly every page view.
// `next: { revalidate }` only helps once this is deployed — `next dev`
// deliberately never caches fetches — so this in-memory map is the layer that
// actually cuts request volume while developing, with the fetch-level cache
// as a bonus in production. A 429 also trips a short cooldown so a rate-limit
// window doesn't turn into a hammering retry loop across page views.
const responseCache = new Map<string, { value: unknown; expiresAt: number }>();
let cooldownUntilMs = 0;

async function requestIGDB(endpoint: string, body: string, cacheSeconds?: number): Promise<unknown> {
  const cacheKey = `${endpoint}:${body}`;
  if (cacheSeconds) {
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
  }

  const remainingCooldownMs = cooldownUntilMs - Date.now();
  if (remainingCooldownMs > 0) {
    throw new Error(`IGDB is rate-limited; retry after ${Math.ceil(remainingCooldownMs / 1000)}s`);
  }

  const clientId = process.env.IGDB_CLIENT_ID?.trim();
  if (!clientId) throw new Error("Missing IGDB_CLIENT_ID in .env.local");
  const sendRequest = async (forceRefresh = false) => fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: "POST",
      headers: { "Client-ID": clientId, Authorization: `Bearer ${await getIGDBAccessToken(forceRefresh)}`, "Content-Type": "text/plain" },
      body,
      ...(cacheSeconds ? { next: { revalidate: cacheSeconds } } : { cache: "no-store" as const }),
    });

  let response = await sendRequest();
  if (response.status === 401) {
    cachedToken = null;
    response = await sendRequest(true);
  }
  if (!response.ok) {
    if (response.status === 429) cooldownUntilMs = Date.now() + 10_000;
    throw new Error(`IGDB request failed (${response.status}): ${await response.text()}`);
  }
  const data = await response.json();
  if (cacheSeconds) responseCache.set(cacheKey, { value: data, expiresAt: Date.now() + cacheSeconds * 1000 });
  return data;
}

function toGame(game: IGDBGame): Game {
  const landscapeImage = [...(game.artworks ?? []), ...(game.screenshots ?? [])].find(
    (image) => image.image_id && (!image.width || !image.height || image.width > image.height),
  );
  return {
    id: String(game.id), slug: game.slug || String(game.id), title: game.name,
    description: game.summary || game.storyline || "No description is available for this game.",
    coverGradient: ["#141414", "#292929"],
    coverImage: game.cover?.image_id ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${game.cover.image_id}.jpg` : undefined,
    backdropImage: landscapeImage?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_1080p/${landscapeImage.image_id}.jpg`
      : undefined,
    screenshots: (game.screenshots ?? [])
      .filter((image) => Boolean(image.image_id))
      .slice(0, 8)
      .map((image) => `https://images.igdb.com/igdb/image/upload/t_screenshot_big/${image.image_id}.jpg`),
    videos: (game.videos ?? [])
      .filter((video): video is { name?: string; video_id: string } => Boolean(video.video_id))
      .map((video) => ({ name: video.name || "Game trailer", videoId: video.video_id })),
    themes: game.themes?.map(({ name }) => name) ?? [],
    gameModes: game.game_modes?.map(({ name }) => name) ?? [],
    playerPerspectives: game.player_perspectives?.map(({ name }) => name) ?? [],
    gameEngines: game.game_engines?.map(({ name }) => name) ?? [],
    franchises: game.franchises?.map(({ name }) => name) ?? [],
    genres: game.genres?.map(({ name }) => name) ?? [], platforms: game.platforms?.map(({ name }) => name) ?? [],
    rating: game.rating ? game.rating / 20 : 0,
    releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : "", prices: [],
  };
}

function escapeQuery(value: string): string { return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"'); }

export function getPopularGames(limit = 40): Promise<Game[]> {
  return requestGames(`fields ${GAME_FIELDS}; where cover != null & rating_count > 20; sort rating_count desc; limit ${limit};`, 300);
}

async function getTaxonomyId(endpoint: "genres" | "platforms", name: string): Promise<number | undefined> {
  const matches = (await requestIGDB(endpoint, `fields id; where name = "${escapeQuery(name)}"; limit 1;`, 3600)) as Array<{ id: number }>;
  return matches[0]?.id;
}

export async function getFilteredGames(filters: { genre?: string; platform?: string }, limit = 100): Promise<Game[]> {
  const [genreId, platformId] = await Promise.all([
    filters.genre ? getTaxonomyId("genres", filters.genre) : undefined,
    filters.platform ? getTaxonomyId("platforms", filters.platform) : undefined,
  ]);
  if ((filters.genre && !genreId) || (filters.platform && !platformId)) return [];

  const clauses = ["cover != null"];
  if (genreId) clauses.push(`genres = (${genreId})`);
  if (platformId) clauses.push(`platforms = (${platformId})`);
  return requestGames(`fields ${GAME_FIELDS}; where ${clauses.join(" & ")}; sort rating_count desc; limit ${Math.min(limit, 500)};`, 300);
}

export async function getGameBySlug(slug: string): Promise<Game | undefined> {
  return (await requestGames(`fields ${GAME_FIELDS}; where slug = "${escapeQuery(slug)}"; limit 1;`, 300))[0];
}

export function searchIGDBGames(query: string, limit = 10): Promise<Game[]> {
  const trimmed = query.trim();
  if (!trimmed) return getPopularGames(limit);
  return requestGames(`search "${escapeQuery(trimmed)}"; fields ${GAME_FIELDS}; where cover != null; limit ${limit};`, 120);
}
