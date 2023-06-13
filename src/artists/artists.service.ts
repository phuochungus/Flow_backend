import { Injectable } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { HttpService } from '@nestjs/axios';
import { EntityType } from 'src/albums/entities/album.entity';
import { SimplifiedArtistWithImages } from './entities/simplified-artist-with-images.entity';
import { Artist } from './entities/artist.entity';

@Injectable()
export class ArtistsService {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    private readonly httpService: HttpService,
  ) {}

  async getArtistInfo(artistId: string): Promise<Artist> {
    const artist = await this.spotifyApiService.findArtistWithFormat(artistId);
    const { summary, content } = (
      await this.httpService.axiosRef.get(
        `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist.name}&api_key=${process.env.LASTFM_API_KEY}&format=json`,
      )
    ).data.artist.bio;
    return {
      ...artist,
      bio: {
        summary,
        content,
      },
    };
  }

  async getTypicalArtists(): Promise<SimplifiedArtistWithImages[]> {
    const PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';
    const artists = await this.spotifyApiService.getAlbumArtists(PLAYLIST_ID);
    return artists.map((e) => {
      return {
        id: e.id,
        type: EntityType.artist,
        name: e.name,
        images: e.images,
      };
    });
  }
}
