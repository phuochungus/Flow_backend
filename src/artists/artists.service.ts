import { Injectable } from '@nestjs/common';
import { SpotifyApiService } from 'src/spotify-api/spotify-api.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ArtistsService {
  constructor(
    private readonly spotifyApiService: SpotifyApiService,
    private readonly httpService: HttpService,
  ) {}

  async getArtistInfo(artistId: string) {
    const artist = await this.spotifyApiService.findArtistWithFormat(artistId);
    const { summary, content } = (
      await this.httpService.axiosRef.get(
        `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${artist.name}&api_key=${process.env.LASTFM_API_KEY}&format=json`,
      )
    ).data.artist.bio;
    return {
      type: 'artist',
      ...artist,
      bio: {
        summary,
        content,
      },
    };
  }

  async getTypicalArtists() {
    const PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';
    const artists = await this.spotifyApiService.getAlbumArtists(PLAYLIST_ID);
    return artists.map((e) => {
      return { name: e.name, id: e.id, images: e.images };
    });
  }
}
