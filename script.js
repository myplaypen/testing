const videoPlayer = (function makeVideoPlayer() {
  let player;

  function loadIframeScript() {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  function onYouTubeIframeAPIReady() {
    const frameContainer = document.querySelector(".video");
    addPlayer(frameContainer);
  }
 
  
    function createResetHandler(player) {
    const resetVideo = document.querySelectorAll(".exit");
      document.addEventListener("click", function resetVideoHandler() {
        player.destroy();
        console.log("removePlayer");
      });
    
  }

  function onPlayerReady(event) {
    const player = event.target;
    player.setVolume(100);
    createResetHandler(player);
  }
  

  function addPlayer(video) {
    const options = {
      height: 360,
      host: "https://www.youtube-nocookie.com",
      videoId: video.dataset.id,
      /*videoId: 'testing',*/
      width: 640
    };
    options.playerVars = {
      autoplay: 0,
      cc_load_policy: 0,
      controls: 1,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      //loop:1,
      //playlist:0,
      rel: 0
    };
    options.events = {
      "onReady": onPlayerReady
    };

    options.playerVars.loop = 1;
    options.playerVars.playlist = video.dataset.id;
    player = new YT.Player(video, options);
  }

  function init() {
    player = null;
    loadIframeScript();
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
  }

  return {
    init
  };
}());
videoPlayer.init();
