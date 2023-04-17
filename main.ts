import { Console } from "console";
import { ZingMp3 } from "zingmp3-api-full-v2";

let musicUrl = "";
let musicId = "";

async function playSong(songName: string): Promise<void> {
  if (songName == "Ưng quá chừng") throw new Error("Song not playable");

  await ZingMp3.search(songName).then((data) => {
    musicId = data.data.songs[0].encodeId;
    musicUrl = "http://api.mp3.zing.vn/api/streaming/audio/" + musicId + "/128";
  });
}

async function fetchMusic() {
  try {
    let response = await fetch(musicUrl, {
      headers: {
        responseType: "arraybuffer",
      },

      redirect: "follow",
    });
    console.log(response.body);
    let stream: ReadableStream<Uint8Array> | null = response.body;
    if (stream) {
      let reader = stream.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        console.log("recieved", value.length);
      }
      console.log("complete");
    }
  } catch (error) {
    console.log(musicUrl);
    console.log("error");
  }
}

playSong("Bật tình yêu lên").then(() => {
  fetchMusic();
});
