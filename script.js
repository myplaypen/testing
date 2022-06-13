const manageCover = (function makeManageCover() {

  function show(el) {
    el.classList.remove("hide");
  }

  function hide(el) {
    el.classList.add("hide");
  }

  function openCurtain(cover) {
    hide(cover);
    const curtain = document.querySelector(".curtain");
    curtain.classList.add("slide");
    return curtain;
  }

  function showVideo(curtain) {
    const thewrap = curtain.parentElement.querySelector(".wrap");
    show(thewrap);
  }

  function coverClickHandler(evt) {
    const cover = evt.currentTarget;
    const curtain = openCurtain(cover);
    showVideo(curtain);
    cover.dispatchEvent(new Event("afterClick"));
  }

  function init(callback) {
    const cover = document.querySelector(".play");
    cover.addEventListener("click", coverClickHandler);
    cover.addEventListener("afterClick", callback);
  }

  return {
    init
  };
}());

const videoPlayer = (function makeVideoPlayer() {
  const config = {
    eventHandlers: {},
    iframeScriptUrl: "https://www.youtube.com/iframe_api"
  };
  let playlist = "";
  let player = null;

  function setYoutubeIframeUrl(url) {
    config.iframeScriptUrl = url;
  }

  function loadIframeScript(url) {
    const tag = document.createElement("script");
    tag.src = url;
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  function onYouTubeIframeAPIReady() {
    const cover = document.querySelector(".play");
    const wrapper = cover.parentElement;
    const frameContainer = wrapper.querySelector(".video");
    addPlayer(frameContainer, playlist);
  }

  function getIframe(player) {
    return Object.values(player).find(
      (item) => item.nodeName === "IFRAME"
    );
  }

  function shufflePlaylist(player) {
    player.setShuffle(true);
    player.playVideoAt(0);
    player.stopVideo();
  }

  function onPlayerReady(event) {
    player = event.target;
    player.setVolume(100);
    shufflePlaylist(player);
    const iframe = getIframe(player);
    iframe.dispatchEvent(new Event("afterPlayerReady"));
  }

  function checksVideo(video) {
    const hasVideo = video && video.classList.contains("video");
    if (!hasVideo) {
      throw new TypeError("Element needs a video classname.");
    }
  }

  function addPlayer(video, playlist) {
    if (!playlist) {
      throw new TypeError("A playlist is required.");
    }
    checksVideo(video);

    const options = {
      height: 360,
      host: "https://www.youtube-nocookie.com",
      width: 640
    };
    options.playerVars = {
      autoplay: 0,
      cc_load_policy: 0,
      controls: 1,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      loop: 1,
      playlist,
      rel: 0
    };
    options.events = {
      "onReady": onPlayerReady
    };

    player = new YT.Player(video, options);

    const iframe = getIframe(player);
    const eventHandler = config.eventHandlers.afterPlayerReady;
    iframe.addEventListener("afterPlayerReady", eventHandler);
  }

  function play() {
    player.playVideo();
  }

  function addEvents() {
    config.eventHandlers.afterPlayerReady = videoPlayer.afterPlayerReady;
  }

  function init(videoIds) {
    loadIframeScript(config.iframeScriptUrl);
    window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    addEvents();
    playlist = videoIds.join();
    return play;
  }

  return {
    init,
    play,
    setYoutubeIframeUrl
  };
}());

describe("manageCover tests", function () {
  function simulateafterClick(el) {
    const clickEvent = new CustomEvent('afterClick');
    el.dispatchEvent(clickEvent);
  }

  function simulateClick(el) {
    const clickEvent = new MouseEvent('click', {
      currentTarget: 'el'
    });
    el.dispatchEvent(clickEvent);
  }

  function removeEventHandlers(el) {
    el.outerHTML = el.outerHTML;
  }

  let curtain;
  let wrap;
  let cover;

  beforeEach(function () {
    curtain = document.querySelector(".curtain");
    wrap = document.querySelector(".wrap");
    cover = document.querySelector(".play");
  });

  afterEach(function () {
    removeEventHandlers(cover);
  });

  function resetCover() {
    cover.classList.remove("hide");
    curtain.classList.remove("slide");
    wrap.classList.add("hide");
  }

  describe("init", function () {
    afterEach(function () {
      resetCover();
    });

    it("adds a click event to the cover", function () {
      //given
      manageCover.init();
      curtain.classList.remove("slide");

      //when
      simulateClick(cover);

      //then
      expect(curtain).toHaveClass("slide");
    });

    it("defines the afterClick event", function () {
      //given
      const callbackSpy = jasmine.createSpy("afterClick-callback");

      manageCover.init(callbackSpy);

      //when
      simulateafterClick(cover);

      //then
      expect(callbackSpy).toHaveBeenCalled();

    });
  });

  describe("coverClickHandler", function () {

    afterEach(function () {
      resetCover();
    });

    it("doesn’t hide an uninitialized cover", function () {
      //given
      cover.classList.remove("hide");

      //when
      simulateClick(cover);

      //then
      expect(cover).not.toHaveClass("hide");
    });

    it("hides the cover", function () {
      //given
      manageCover.init();

      cover.classList.remove("hide");

      //when
      simulateClick(cover);

      //then
      expect(cover).toHaveClass("hide");
    });

    it("slides the curtain", function () {
      //given
      manageCover.init();

      curtain.classList.remove("slide");

      //when
      simulateClick(cover);

      //then
      expect(curtain).toHaveClass("slide");
    });

    it("shows the video", function () {
      //given
      manageCover.init();

      wrap.classList.add("hide");

      //when
      simulateClick(cover);

      //then
      expect(wrap).not.toHaveClass("hide");
    });

    it("dispatches the afterClick event", function () {
      //given
      const callbackSpy = jasmine.createSpy("afterClick-callback");

      manageCover.init(callbackSpy);

      //when
      simulateClick(cover);

      //then
      expect(callbackSpy).toHaveBeenCalled();
    });
  });
});

describe("videoPlayer tests", function () {
  let iframe;
  let fakePlayer;
  let options;

  beforeAll(function () {
    iframe = stubYT();
    videoPlayer.setYoutubeIframeUrl("https://www.example.com/iframe_api");
  });
  afterAll(function () {
    videoPlayer.setYoutubeIframeUrl("https://www.youtube.com/iframe_api");
  });

  function createVideo() {
    const video = document.createElement("div");
    video.classList.add("video");
    return video;
  }

  function stubYT() {
    const randomPropertyNames = ["d", "e", "f", "g", "h"].sort(function () {
      return Math.random() - 0.5;
    });

    const iframe = document.createElement("iframe");
    window.YT = {
      Player: function makePlayer(video, playerOptions) {
        options = playerOptions;
        fakePlayer = {

          i: {
            h: playerOptions
          },
          m: video,
          playVideo: jasmine.createSpy("playVideo-handler"),
          playVideoAt: jasmine.createSpy("playVideoAt-handler"),
          setShuffle: jasmine.createSpy("setShuffle-handler"),
          setVolume: jasmine.createSpy("setVolume-handler"),
          stopVideo: jasmine.createSpy("stopVideo-handler")
        };
        fakePlayer[randomPropertyNames[0]] = iframe;
        return fakePlayer;
      }
    };
    return iframe;
  }

  function initVideoPlayer(videoIds = ["0dgNc5S8cLI"]) {
    videoPlayer.afterPlayerReady = jasmine.createSpy("afterPlayerReady-handler");
    const playFunc = videoPlayer.init(videoIds);
    window.onYouTubeIframeAPIReady();
    return playFunc;
  }

  function triggerAfterPlayerReady(el) {
    const afterPlayerReady = new window.CustomEvent("afterPlayerReady");
    el.dispatchEvent(afterPlayerReady);
  }
  describe("init", function () {
    it("makes onYouTubeIframeAPIReady available", function () {
      initVideoPlayer();
      expect(typeof window.onYouTubeIframeAPIReady).toBe("function");
    });
    it("loads iframe script", function () {
      //given
      document.querySelectorAll("script").forEach(function (script) {
        if (script.src.includes("iframe_api")) {
          script.remove();
        }
      });

      //when
      initVideoPlayer();

      //then
      const src = document.querySelector("script").src;
      expect(src).toContain("iframe_api");
    });
    it("init with separate items in a list of videos for the playlist", function () {
      //given
      const videoIds = ["0dgNc5S8cLI", "mnfmQe8Mv1g", "CHahce95B1g", "2VwsvrPFr9w"];

      //when
      initVideoPlayer(videoIds);

      //then
      const playlist = options.playerVars.playlist;
      expect(playlist).toBe("0dgNc5S8cLI,mnfmQe8Mv1g,CHahce95B1g,2VwsvrPFr9w");
    });

    it("afterPlayerReady handler", function () {
      //given
      initVideoPlayer();

      //when
      triggerAfterPlayerReady(iframe);

      //then
      expect(videoPlayer.afterPlayerReady).toHaveBeenCalled();
    });
    it("returns a play function when initialized", function () {
      //given
      fakePlayer = undefined;

      //when
      const playback = initVideoPlayer();
      playback();

      //then
      expect(fakePlayer.playVideo).toHaveBeenCalled();
    });
  });
  describe("addPlayer", function () {
    beforeEach(function () { });
    it("addPlayer requires a video element", function () {
      //given  
      const fragment = new DocumentFragment();
      fragment.appendChild(document.querySelector(".video"));

      //when
      function failsWithMissingVideoElement() {
        initVideoPlayer();
      }

      //then
      expect(initVideoPlayer).toThrowError("Element needs a video classname.");

      // cleanup
      document.querySelector(".wrap").appendChild(fragment.lastChild);
    });
    it("passes video to the player object", function () {
      //given
      fakePlayer = undefined;

      //when
      initVideoPlayer();

      //then
      expect(fakePlayer.m.classList).toContain("video");
    });
    it("has dimensions", function () {
      //given
      options = undefined;

      //when
      initVideoPlayer();

      //then
      expect(typeof options.width).toBe("number");
      expect(options.width).toBeGreaterThan(0);
    });
    it("has playerVars", function () {
      //given
      options = undefined;

      //when
      initVideoPlayer();

      //then
      const playerVars = options.playerVars;

      expect(typeof playerVars.cc_load_policy).toBe("number");
      expect(playerVars.cc_load_policy).toBe(0);
    });
    it("needs a playlist", function () {
      //given
      const videoIds = [];

      //when
      const initWithNoVideos = function () {
        initVideoPlayer(videoIds);
      };

      //then
      expect(initWithNoVideos).toThrowError("A playlist is required.");
    });
    it("has a playlist", function () {
      //given
      options = undefined;

      //when
      initVideoPlayer([
        "0dgNc5S8cLI",
        "mnfmQe8Mv1g",
        "CHahce95B1g",
        "2VwsvrPFr9w"
      ]);

      //then
      const playlist = "0dgNc5S8cLI,mnfmQe8Mv1g,CHahce95B1g,2VwsvrPFr9w"
      const playerVars = options.playerVars;
      expect(playerVars.playlist).toBe(playlist);
    });
    it("has onReady event", function () {
      //given
      options = undefined;

      //when
      initVideoPlayer();

      //then
      expect(typeof options.events.onReady).toBe("function");
    });

  });
  describe("playerReady", function () {

    function triggerOnReady() {
      const onReady = options.events.onReady;
      const evt = {
        target: fakePlayer
      };
      onReady(evt);
    }

    it("sets volume", function () {
      //given
      fakePlayer = undefined;
      initVideoPlayer();

      //when
      triggerOnReady();

      //then
      expect(fakePlayer.setVolume).toHaveBeenCalled();
    });
    it("dispatches the afterPlayerReady event", function () {
      //given
      initVideoPlayer();

      //when
      triggerOnReady();

      //then
      expect(videoPlayer.afterPlayerReady).toHaveBeenCalled();
    });
    it("enables setShuffle", function () {
      //given
      fakePlayer = undefined;
      initVideoPlayer();

      //when
      triggerOnReady();

      //then
      expect(fakePlayer.setShuffle).toHaveBeenCalledWith(true);
    });
    it("resets play order", function () {
      //given
      fakePlayer = undefined;
      initVideoPlayer();

      //when
      triggerOnReady();

      //then
      expect(fakePlayer.playVideoAt).toHaveBeenCalledWith(0);
    });
    it("stops video after resetting play order", function () {
      //given
      fakePlayer = undefined;
      initVideoPlayer();

      //when
      triggerOnReady();

      //then
      expect(fakePlayer.stopVideo).toHaveBeenCalled();
    });
  });
});
setTimeout(function () {
  const videoIds = [
    "0dgNc5S8cLI",
    "mnfmQe8Mv1g",
    "CHahce95B1g",
    "2VwsvrPFr9w"
  ];
  /*
  function initCover() {
    manageCover.init(function playVideo() {
      videoPlayer.play();
    });
  }
  videoPlayer.afterPlayerReady = initCover;
  videoPlayer.init(videoIds);
  */
  /* manageCover.init(
     videoPlayer.init(videoIds)
   );*/
  manageCover.init(videoPlayer.init(videoIds));
}, 200);
