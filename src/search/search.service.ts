import { Inject, Injectable } from '@nestjs/common';
import { SearchResult } from './dto/search-track.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import Fuse from 'fuse.js';
import { SimplifiedAlbumWithPopularity } from '../albums/entities/simplified-album-for-search.dto';
import { EntityType } from '../albums/schemas/album.schema';
import { SimplifiedArtistWithPopulary } from '../artists/entities/simplified-artist-for-search.entity';
import { SimplifedTrackWithPopularity } from '../tracks/entities/simplify-track-for-search.dto';

export type SimplifiedEntity =
  | SimplifedTrackWithPopularity
  | SimplifiedAlbumWithPopularity
  | SimplifiedArtistWithPopulary;

@Injectable()
export class SearchService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private readonly spotifyApiService: SpotifyApiService,
  ) {}
  async searchInSpotify(
    queryString: string,
    page: number = 0,
  ): Promise<SearchResult> {
    const cachedResult = await this.cacheManager.get(
      `search_page_${page}_query_${queryString}`,
    );

    if (cachedResult) {
      return cachedResult as SearchResult;
    }

    const res = (
      await this.spotifyApiService.spotifyWebApi.search(
        queryString,
        ['track', 'album', 'artist'],
        { market: 'VN', limit: 15, offset: page * 15 },
      )
    ).body;

    let albumWithoutPopularity;
    if (res.albums) {
      albumWithoutPopularity = (
        await this.spotifyApiService.spotifyWebApi.getAlbums(
          res.albums.items.map(({ id }) => id),
        )
      ).body;
    } else {
      albumWithoutPopularity = [];
    }

    let albums: SimplifiedAlbumWithPopularity[] =
      albumWithoutPopularity.albums.map((e) => {
        return {
          id: e.id,
          type: EntityType.album,
          popularity: e.popularity,
          name: e.name,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          images: e.images,
        };
      });

    let tracks: SimplifedTrackWithPopularity[];
    if (res.tracks) {
      tracks = res.tracks.items.map((e) => {
        return {
          id: e.id,
          type: EntityType.track,
          name: e.name,
          images: e.album.images,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          popularity: e.popularity,
        };
      });
    } else {
      tracks = [];
    }

    let artists: SimplifiedArtistWithPopulary[];
    if (res.artists) {
      artists = res.artists.items.map((e) => {
        return {
          id: e.id,
          type: EntityType.artist,
          name: e.name,
          images: e.images,
          popularity: e.popularity,
        };
      });
    } else {
      artists = [];
    }

    artists = artists.filter((e) => e.images.length != 0);
    artists = artists.filter((e) => e.popularity != 0);
    let mostRelevantResults: SimplifiedEntity[] = [
      ...tracks,
      ...artists,
      ...albums,
    ];

    const mostRelevant = this.calculateScore(mostRelevantResults, queryString);

    this.cacheManager.set(`search_page_${page}_query_${queryString}`, {
      mostRelevant,
      albums,
      tracks,
      artists,
    });

    return {
      mostRelevant,
      albums,
      tracks,
      artists,
    };
  }

  private calculateScore(
    mostRelevantResults: SimplifiedEntity[],
    searchString: string,
  ): SimplifiedEntity[] {
    const fuse = new Fuse(mostRelevantResults, {
      keys: ['name'],
      includeScore: true,
    });

    let result = fuse.search(searchString);
    result.sort((n1, n2) => {
      if (n1.score && n2.score) {
        const tmp = n1.score - n2.score;
        if (tmp != 0) return tmp;
      }
      return n2.item.popularity - n1.item.popularity;
    });
    const originArray = result.map((e) => {
      return e.item;
    });
    return originArray;
  }
}
