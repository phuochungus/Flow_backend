import { Injectable, NotFoundException } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { extend } from 'lodash';
import distance from 'jaro-winkler';
import MusixMatch from 'musixmatch-richsync';
import { YoutubeApiService } from 'src/youtube-api/youtube-api.service';
import { SpotifyToYoutubeService } from 'src/spotify-to-youtube/spotify-to-youtube.service';

@Injectable()
export class SpotifyApiService {
  constructor(
    private readonly youtubeApiService: YoutubeApiService,
    private readonly spotifyToYoutubeService: SpotifyToYoutubeService,
  ) {
    this.requestAccessToken();
    setInterval(this.requestAccessToken, 3300000);
  }

  private spotifyWebApi: SpotifyWebApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  private mm = new MusixMatch([process.env.MUSIXMATCH_API_KEY]);

  async requestAccessToken() {
    this.spotifyWebApi.clientCredentialsGrant().then((data: any) => {
      this.spotifyWebApi.setAccessToken(data.body.access_token);
    });
  }

  async searchInSpotify(queryString: string, page: number = 0): Promise<any> {
    try {
      const res = await this.spotifyWebApi.search(
        queryString,
        ['track', 'album', 'artist'],
        { market: 'VN', limit: 15, offset: page * 15 },
      );

      let albumRes = await this.spotifyWebApi.getAlbums(
        res.body.albums.items.map((e) => e.id),
      );
      let albums = albumRes.body.albums.map((e) => {
        return {
          type: 'album',
          popularity: e.popularity,
          name: e.name,
          id: e.id,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          images: e.images,
        };
      });

      let tracks = res.body.tracks.items.map((e) => {
        return {
          type: 'track',
          popularity: e.popularity,
          name: e.name,
          id: e.id,
          artists: e.artists.map((e) => {
            return { name: e.name, id: e.id };
          }),
          images: e.album.images,
        };
      });

      let artists = res.body.artists.items.map((e) => {
        return {
          type: 'artist',
          popularity: e.popularity,
          name: e.name,
          id: e.id,
        };
      });

      let mostRelevantResults: {
        type: string;
        popularity: number;
        name: string;
        id: string;
        score?: number;
      }[] = [...tracks, ...artists, ...albums];

      this.calculateScore(mostRelevantResults, queryString);

      mostRelevantResults.sort((n1, n2) => {
        if (n1.score && n2.score) {
          const n1Score = (n1.popularity * 5) / 100 + 5 * n1.score;
          const n2Score = (n2.popularity * 5) / 100 + 5 * n2.score;
          if (n1Score < n2Score) return 1;
          else if (n1Score > n2Score) return -1;
          return 0;
        }
        return 0;
      });

      return {
        mostRelevantResults,
        albums,
        tracks,
        artists,
      };
    } catch (error) {
      console.log(error);
    }
  }

  calculateScore(
    mostRelevantResults: {
      type: string;
      popularity: number;
      name: string;
      id: string;
    }[],
    searchString: string,
  ) {
    for (let index in mostRelevantResults) {
      extend(mostRelevantResults[index], {
        score: distance(searchString, mostRelevantResults[index].name),
      });
    }
  }

  async findOneTrack(id: string): Promise<SpotifyApi.SingleTrackResponse> {
    return (await this.spotifyWebApi.getTrack(id)).body;
  }

  async findOneTrackWithFormat(id: string): Promise<{
    id: string;
    name: string;
    type: string;
    duration_ms: number;
    images: SpotifyApi.ImageObject[];
    artists: { id: string; name: string }[];
  }> {
    const trackMetaInfo = (await this.spotifyWebApi.getTrack(id)).body;
    return {
      id: trackMetaInfo.id,
      name: trackMetaInfo.name,
      type: 'track',
      duration_ms: trackMetaInfo.duration_ms,
      images: trackMetaInfo.album.images,
      artists: trackMetaInfo.artists.map((e) => {
        return { id: e.id, name: e.name };
      }),
    };
  }

  async getLyric(id: string) {
    const ISRC = (await this.spotifyWebApi.getTrack(id)).body.external_ids.isrc;
    try {
      const body = (await this.mm.getRichsyncLyrics(ISRC)).richsync_body;
      return body.map((e) => {
        return { start: e.start, end: e.end, text: e.text };
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async getTop50TracksVietnam() {
    const PLAYLIST_ID = '37i9dQZEVXbLdGSmz6xilI';

    return (
      await this.spotifyWebApi.getPlaylistTracks(PLAYLIST_ID)
    ).body.items.map((e) => {
      return {
        id: e.track.id,
        name: e.track.name,
        images: e.track.album.images,
        duration_ms: e.track.duration_ms,
        artists: e.track.artists.map((e) => {
          return { id: e.id, name: e.name };
        }),
      };
    });
  }

  async findArtistWithFormat(id: string) {
    let res;
    await Promise.all([
      this.spotifyWebApi.getArtistAlbums(id),
      this.spotifyWebApi.getArtist(id),
      this.spotifyWebApi.getArtistRelatedArtists(id),
      this.spotifyWebApi.getArtistTopTracks(id, 'VN'),
    ]).then(async (value) => {
      let topTracksPromises = value[3].body.tracks.map(async (e) => {
        return {
          id: e.id,
          name: e.name,
          images: e.album.images,
          viewCount: await this.youtubeApiService.getViewCount(
            await this.spotifyToYoutubeService.getYoutubeIdFromSpotifyTrack(e),
          ),
        };
      });

      let topTracks;
      await Promise.all(topTracksPromises).then((value) => {
        topTracks = value;
      });
      res = {
        id: value[1].body.id,
        name: value[1].body.name,
        topTracks,
        albums: value[0].body.items.map((e) => {
          return {
            id: e.id,
            name: e.name,
            images: e.images,
          };
        }),
        relatedArtists: value[2].body.artists.map((e) => {
          return {
            id: e.id,
            name: e.name,
            images: e.images,
          };
        }),
      };
    });
    return res;
  }

  async getAlbumArtists(id: string) {
    const tracks = (
      await this.spotifyWebApi.getPlaylistTracks(id, { limit: 20 })
    ).body;
    const artistIds = new Set<string>();

    tracks.items.forEach((e) => {
      e.track.artists.forEach((artist) => artistIds.add(artist.id));
    });
    let artists = await this.spotifyWebApi.getArtists(Array.from(artistIds));
    return artists.body.artists;
  }
}
