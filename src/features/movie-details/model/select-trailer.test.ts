import { describe, it, expect } from 'vitest'
import { selectTrailer } from './use-movie-details-query'
import type { MovieVideo } from '@/entities/movie'

function makeVideo(overrides: Partial<MovieVideo> = {}): MovieVideo {
  return {
    id: 'v1',
    key: 'abc123',
    name: 'Video',
    site: 'YouTube',
    type: 'Trailer',
    official: false,
    ...overrides,
  }
}

describe('selectTrailer', () => {
  it('retorna null quando não há vídeos', () => {
    expect(selectTrailer([])).toBeNull()
  })

  it('retorna null quando não há vídeos do YouTube', () => {
    const videos = [makeVideo({ site: 'Vimeo' })]
    expect(selectTrailer(videos)).toBeNull()
  })

  it('prioriza trailer oficial do YouTube', () => {
    const official = makeVideo({ id: 'off', official: true, key: 'official' })
    const unofficial = makeVideo({ id: 'unoff', official: false, key: 'unoff' })
    expect(selectTrailer([unofficial, official])).toBe(official)
  })

  it('usa trailer não-oficial quando não há oficial', () => {
    const trailer = makeVideo({ official: false, key: 't1' })
    expect(selectTrailer([trailer])).toBe(trailer)
  })

  it('usa teaser quando não há trailer', () => {
    const teaser = makeVideo({ type: 'Teaser', key: 'teaser1' })
    const featurette = makeVideo({ type: 'Featurette', key: 'feat1' })
    expect(selectTrailer([featurette, teaser])).toBe(teaser)
  })

  it('usa primeiro vídeo YouTube como fallback final', () => {
    const clip = makeVideo({ type: 'Clip', key: 'clip1' })
    expect(selectTrailer([clip])).toBe(clip)
  })

  it('ignora vídeos não-YouTube ao escolher trailer', () => {
    const vimeo = makeVideo({ site: 'Vimeo', type: 'Trailer', official: true, id: 'vim' })
    const ytClip = makeVideo({ type: 'Clip', key: 'yt1', id: 'yt1' })
    expect(selectTrailer([vimeo, ytClip])).toBe(ytClip)
  })
})
