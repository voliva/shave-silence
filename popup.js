async function init() {
  const numberOfVideos = await getNumberOfVideos();
  setVisible(elements.loading, false);

  if (numberOfVideos === 0) {
    setVisible(elements.noVideos, true);
    return;
  }
  setVisible(elements.main, true);

  elements.videoNum.querySelector("span").innerText = `[0-${numberOfVideos}]`;
}

const elements = {
  loading: document.querySelector("#loading"),
  noVideos: document.querySelector("#no-videos"),
  main: document.querySelector("#main"),
  videoNum: document.querySelector("#video-num"),
  low_t: document.querySelector("#low_t"),
  low_s: document.querySelector("#low_s"),
  high_t: document.querySelector("#high_t"),
  high_s: document.querySelector("#high_s"),
  play: document.querySelector("#play"),
  stop: document.querySelector("#stop"),
};
const setVisible = (element, visible) =>
  visible
    ? element.classList.remove("hidden")
    : element.classList.add("hidden");

elements.play.addEventListener("click", () => {
  const paramElements = {
    low_t: elements.low_t,
    low_s: elements.low_s,
    high_t: elements.high_t,
    high_s: elements.high_s,
  };
  const params = Object.fromEntries(
    Object.entries(paramElements).map(([key, element]) => [
      key,
      Number(element.querySelector("input").value),
    ])
  );
  const n = Number(elements.videoNum.querySelector("input").value);
  play(params, n);
});

elements.stop.addEventListener("click", stop);

init();

/** Remote calls */
async function getNumberOfVideos() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
      if (window.SHAVE_SILENCE) {
        return window.SHAVE_SILENCE.detectVideos();
      }
      return 0;
    },
  });

  return Number(result[0].result);
}

async function play(params, n) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [params, n],
    function: (params, n) => window.SHAVE_SILENCE.play(params, n),
  });
}
async function stop() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => window.SHAVE_SILENCE.stop(),
  });
}
