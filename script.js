const track = document.getElementById("image-track");

const handleOnDown = e => track.dataset.mouseDownAt = e.clientX;

const handleOnUp = () => {
  track.dataset.mouseDownAt = "0";
  track.dataset.prevPercentage = track.dataset.percentage;
}

const handleOnMove = e => {
  if (track.dataset.mouseDownAt === "0") return;

  const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
    maxDelta = window.innerWidth / 2;

  const percentage = (mouseDelta / maxDelta) * -100,
    nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage,
    nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);

  track.dataset.percentage = nextPercentage;

  const isMobile = window.innerWidth <= 900;
  track.animate({
    transform: `translate(${nextPercentage}%, ${isMobile ? '0%' : '-50%'})`
  }, { duration: 1200, fill: "forwards" });

  for (const image of track.getElementsByClassName("image")) {
    image.animate({
      objectPosition: `${100 + nextPercentage}% center`
    }, { duration: 1200, fill: "forwards" });
  }
}

/* -- Had to add extra lines for touch events -- */

window.onmousedown = e => handleOnDown(e);

window.ontouchstart = e => handleOnDown(e.touches[0]);

window.onmouseup = e => handleOnUp(e);

window.ontouchend = e => handleOnUp(e.touches[0]);

window.onmousemove = e => handleOnMove(e);

window.ontouchmove = e => handleOnMove(e.touches[0]);

/* -- Auto-scroll functionality -- */
let autoScrollInterval;
let autoScrollPercentage = 0;
const autoScrollSpeed = 0.1; // Ajusta este valor para cambiar la velocidad de desplazamiento

const startAutoScroll = () => {
  if (autoScrollInterval) clearInterval(autoScrollInterval);

  autoScrollInterval = setInterval(() => {
    // Solo auto-desplazar si el usuario no está interactuando
    if (track.dataset.mouseDownAt !== "0") return;

    // Actualiza el porcentaje
    autoScrollPercentage -= autoScrollSpeed;

    // Si llega al final (-100%), reiniciar al principio (0%)
    if (autoScrollPercentage <= -75) {
      autoScrollPercentage = 0;
    }

    track.dataset.percentage = autoScrollPercentage;
    track.dataset.prevPercentage = autoScrollPercentage;

    const isMobile = window.innerWidth <= 900;
    track.animate({
      transform: `translate(${autoScrollPercentage}%, ${isMobile ? '0%' : '-50%'})`
    }, { duration: 1200, fill: "forwards" });

    for (const image of track.getElementsByClassName("image")) {
      image.animate({
        objectPosition: `${100 + autoScrollPercentage}% center`
      }, { duration: 1200, fill: "forwards" });
    }
  }, 16); // ~60fps
};

// Iniciar auto-scroll al cargar la página
startAutoScroll();

// Detener el auto-scroll cuando el usuario interactúa (opcional, pero mejora la UX)
const pauseAutoScroll = () => {
  clearInterval(autoScrollInterval);
};

// Reiniciar el auto-scroll después de soltar (después de un pequeño retraso)
let resumeTimeout;
const resumeAutoScroll = () => {
  clearTimeout(resumeTimeout);
  // Sincronizar el auto-scroll con donde el usuario lo dejó
  autoScrollPercentage = parseFloat(track.dataset.percentage) || 0;
  resumeTimeout = setTimeout(startAutoScroll, 2000); // Esperar 2 segundos antes de reanudar
};

// Añadir listeners para pausar/reanudar (sobrescribir los anteriores para incluir esta lógica)
window.onmousedown = e => { pauseAutoScroll(); handleOnDown(e); };
window.ontouchstart = e => { pauseAutoScroll(); handleOnDown(e.touches[0]); };

window.onmouseup = e => { handleOnUp(e); resumeAutoScroll(); };
window.ontouchend = e => { handleOnUp(e.touches[0]); resumeAutoScroll(); };