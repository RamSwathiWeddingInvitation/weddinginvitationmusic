document.addEventListener("DOMContentLoaded", () => {
  const envelopeScreen = document.getElementById("envelopeScreen");
  const openButton = document.getElementById("openInvitation");
  const music = document.getElementById("weddingMusic");
  const musicToggle = document.getElementById("musicToggle");

  function setMusicState(playing) {
    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute("aria-label", playing ? "Pause wedding music" : "Play wedding music");
    musicToggle.textContent = playing ? "♫" : "♪";
  }

  // Music begins on the visitor's first tap (browser autoplay rules require a gesture).
  openButton.addEventListener("click", async () => {
    envelopeScreen.classList.add("is-opening");
    document.body.classList.remove("locked");
    try {
      await music.play();
      setMusicState(true);
    } catch (error) {
      setMusicState(false);
      console.warn("The music could not start. The visitor can use the music button.");
    }
    window.setTimeout(() => {
      envelopeScreen.hidden = true;
      document.getElementById("coverScreen").scrollIntoView({behavior: "smooth"});
    }, 850);
  });

  musicToggle.addEventListener("click", async () => {
    if (music.paused) {
      try {
        await music.play();
        setMusicState(true);
      } catch (error) {
        setMusicState(false);
      }
    } else {
      music.pause();
      setMusicState(false);
    }
  });

  // Countdown to Muhurtham: 13 December 2026, 7:00 AM India time.
  const target = new Date("2026-12-13T07:00:00+05:30").getTime();
  function updateCountdown() {
    const diff = Math.max(0, target - Date.now());
    const values = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
    Object.entries(values).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = String(value).padStart(2, "0");
    });
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // Scratch card supports touch, mouse and stylus.
  const canvas = document.getElementById("scratchCanvas");
  if (canvas) {
    const context = canvas.getContext("2d", {willReadFrequently: true});
    let drawing = false;
    let revealed = false;

    function paintLayer() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, "#e4bd50");
      gradient.addColorStop(.5, "#c99b35");
      gradient.addColorStop(1, "#b98227");
      context.globalCompositeOperation = "source-over";
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);
      context.fillStyle = "rgba(255,255,255,.94)";
      context.font = "italic 25px Allura, cursive";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Scratch here ✨", rect.width / 2, rect.height / 2);
      context.globalCompositeOperation = "destination-out";
    }

    function eraseAt(event) {
      if (!drawing || revealed) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      context.beginPath();
      context.arc(x, y, 18, 0, Math.PI * 2);
      context.fill();

      // Sample alpha values to estimate how much of the gold coating is cleared.
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < pixels.length; i += 4 * 20) {
        total++;
        if (pixels[i] < 20) clear++;
      }
      if (total && clear / total > .43) {
        revealed = true;
        context.clearRect(0, 0, canvas.width, canvas.height);
        const tip = document.querySelector(".scratch-tip");
        if (tip) tip.textContent = "13th December 2026 — our special day! ♥";
      }
    }

    canvas.addEventListener("pointerdown", event => {
      if (revealed) return;
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      eraseAt(event);
    });
    canvas.addEventListener("pointermove", eraseAt);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
      canvas.addEventListener(type, () => { drawing = false; });
    });
    paintLayer();
    window.addEventListener("resize", paintLayer);
  }

  document.body.classList.add("locked");
});
