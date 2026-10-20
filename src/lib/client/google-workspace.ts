/**
 * Google Workspace bridge — Calendar, Tasks and Drive.
 * Uses the REST APIs directly with the configured OAuth refresh token so the
 * platform stays dependency-light and works on a workstation with no SDK setup.
 */

const CALENDAR_BASE = 'https://www.googleapis.com/calendar/v3';
const TASKS_BASE = 'https://tasks.googleapis.com/tasks/v1';
const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';

export interface WorkspaceEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  status: string;
}

let accessToken: string | null = null;
let tokenExpiry = 0;

async function refreshAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;
  if (accessToken && Date.now() < tokenExpiry - 60_000) return accessToken;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) return null;
  const json = (await response.json()) as { access_token: string; expires_in: number };
  accessToken = json.access_token;
  tokenExpiry = Date.now() + json.expires_in * 1000;
  return accessToken;
}

async function authorizedFetch(url: string, init: RequestInit = {}) {
  const token = await refreshAccessToken();
  if (!token) throw new Error('Google Workspace credentials are not configured.');
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Google Workspace request failed (${response.status}).`);
  }
  return response;
}

export function isWorkspaceConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN,
  );
}

/** Upcoming events from the primary engineering calendar. */
export async function listCalendarEvents(days = 7): Promise<WorkspaceEvent[]> {
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + days * 86_400_000).toISOString();
  const url = `${CALENDAR_BASE}/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=50`;
  const json = (await authorizedFetch(url).then((r) => r.json())) as {
    items?: Array<{
      id: string;
      summary?: string;
      status: string;
      start?: { dateTime?: string; date?: string };
      end?: { dateTime?: string; date?: string };
    }>;
  };

  return (json.items ?? []).map((item) => ({
    id: item.id,
    summary: item.summary ?? 'Untitled event',
    start: item.start?.dateTime ?? item.start?.date ?? '',
    end: item.end?.dateTime ?? item.end?.date ?? '',
    status: item.status,
  }));
}

/** Create a mirrored calendar event for a task due date. */
export async function createCalendarEvent(input: {
  summary: string;
  description: string;
  start: string;
  durationMinutes?: number;
}): Promise<WorkspaceEvent> {
  const start = new Date(input.start);
  const end = new Date(start.getTime() + (input.durationMinutes ?? 45) * 60_000);
  const body = {
    summary: input.summary,
    description: input.description,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };
  const json = (await authorizedFetch(`${CALENDAR_BASE}/calendars/primary/events`, {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((r) => r.json())) as {
    id: string;
    summary?: string;
    status: string;
    start?: { dateTime?: string };
    end?: { dateTime?: string };
  };

  return {
    id: json.id,
    summary: json.summary ?? input.summary,
    start: json.start?.dateTime ?? '',
    end: json.end?.dateTime ?? '',
    status: json.status,
  };
}

/** Push a corrective task into the Google Tasks list. */
export async function createGoogleTask(title: string, notes: string): Promise<string> {
  const json = (await authorizedFetch(`${TASKS_BASE}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ title, notes }),
  }).then((r) => r.json())) as { id: string };
  return json.id;
}

/** Search Drive for attached drawings and reports. */
export async function searchDrive(query: string): Promise<Array<{ id: string; name: string }>> {
  const url = `${DRIVE_BASE}/files?q=${encodeURIComponent(
    `name contains '${query}' and trashed = false`,
  )}&fields=files(id,name)&pageSize=25`;
  const json = (await authorizedFetch(url).then((r) => r.json())) as {
    files?: Array<{ id: string; name: string }>;
  };
  return json.files ?? [];
}
