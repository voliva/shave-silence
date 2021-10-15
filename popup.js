async function init() {
  const numberOfVideos = await getNumberOfVideos();
  setVisible(elements.loading, false);

  if (numberOfVideos === 0) {
    setVisible(elements.noVideos, true);
    return;
  }
  setVisible(elements.main, true);
  elements.main.innerHTML = "NumOfVideos: " + numberOfVideos;
}

const elements = {
  loading: document.querySelector("#loading"),
  noVideos: document.querySelector("#no-videos"),
  main: document.querySelector("#main"),
};
const setVisible = (element, visible) =>
  visible
    ? element.classList.remove("hidden")
    : element.classList.add("hidden");

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
