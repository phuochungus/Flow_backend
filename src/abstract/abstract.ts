import { Album } from '../albums/schemas/album.schema';
import { Artist } from '../artists/entities/artist.entity';
import { SimplifiedArtistWithImages } from '../artists/entities/simplified-artist-with-images.entity';
import { SearchResult } from '../search/dto/search-track.dto';
import { Lyrics } from '../tracks/entities/lyrics.entity';
import { Track } from '../tracks/entities/track.entity';
import { Response } from 'express';

export abstract class APIWrapper {
  abstract authorize(): void;
}

export abstract class AlbumRepository {
  abstract findOne(id: string): Promise<Album>;
  abstract findMany(ids: string[]): Promise<Album[]>;
}

export abstract class ArtistRepository {
  abstract findOne(id: string): Promise<Artist>;
  abstract findManyRaw(ids: string[]): Promise<SpotifyApi.ArtistObjectFull[]>;
  abstract findPlaylistArtistsRaw(
    id: string,
  ): Promise<SpotifyApi.ArtistObjectFull[]>;
  abstract findTopArtists(): Promise<SimplifiedArtistWithImages[]>;
}

export abstract class LyricsRepository {
  abstract findOne(id: string): Promise<Lyrics[]>;
}

export abstract class SearchService {
  abstract search(query: string, page: number): Promise<SearchResult>;
}

export abstract class SpotifyToYoutubeSearcherService {
  abstract convertSpotifyIdToYoutubeId(id: string): Promise<string>;
  abstract converSpotifyContentToYoutubeId(
    content: SpotifyApi.SingleTrackResponse,
  ): Promise<string>;
}

export abstract class TrackRepository {
  abstract getMetadata(id: string): Promise<Track>;
  abstract getManyMetadata(ids: string[]): Promise<Track[]>;
  abstract getAudioContent(id: string, response: Response);
  abstract getExploreTrack(genreName: string): Promise<Track[]>;
  abstract getTop50(): Promise<Track[]>;
}

export abstract class SearchMusicService {
  abstract searchMusicContent(query: string): Promise<any>;
}
