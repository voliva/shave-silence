const video = document.querySelector(
  "#movie_player > div.html5-video-container > video"
);
const audioCtx = new AudioContext();
const source = audioCtx.createMediaStreamSource(video.captureStream());
const analyser = audioCtx.createAnalyser();
const dataArray = new Uint8Array(analyser.frequencyBinCount);
source.connect(analyser);

const low_t = 100;
const low_s = 5;
const high_t = 200;
const high_s = 2;
const B = (low_s - high_s) / (low_t - high_t);
const A = 1 - high_t * B;
const MAX_S = Math.max(low_s, high_s);
const MIN_S = Math.min(low_s, high_s);

let changes = 0;
// After these many changes, audio starts to get desynced (aprox) - We'll need to resynchronize
const CHANGE_THRESHOLD = 50;
function frameCallback() {
  if (video.paused) return;
  analyser.getByteTimeDomainData(dataArray);
  let prev = dataArray[0];
  let total = 0;
  for (let i = 1; i < dataArray.length; i++) {
    const diff = dataArray[i] - prev;
    prev = dataArray[i];
    total += diff * diff;
  }

  const playbackRate = Math.round(
    Math.max(MIN_S, Math.min(MAX_S, A + total * B))
  );
  if (video.playbackRate !== playbackRate) {
    video.playbackRate = playbackRate;
    changes++;
    if (changes > CHANGE_THRESHOLD) {
      video.currentTime = video.currentTime;
      changes = 0;
    }
  }
}

// setInterval(frameCallback, 10);

window.SHAVE_SILENCE = {
  detectVideos: () => Array.from(document.querySelectorAll("video")).length,
  play: (n = 0) => {},
};
