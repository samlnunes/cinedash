const BASE_URL = import.meta.env.VITE_TMDB_API_URL
const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE
const API_TOKEN = import.meta.env.VITE_TMDB_API_TOKEN

export class TmdbError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'TmdbError'
  }
}

export async function tmdbFetch<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new TmdbError(
      response.status,
      body.status_message ?? `TMDB request failed (${response.status})`,
    )
  }

  return response.json() as Promise<T>
}

export function posterUrl(
  path: string | null,
  size: 'w185' | 'w342' | 'w500' | 'original' = 'w342',
): string {
  if (!path) return 'https://placehold.co/342x480?text=Sem%20imagem'
  return `${IMAGE_BASE}/${size}${path}`
}
