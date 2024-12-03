const paper = document.querySelector("#paper"),
  pen = paper.getContext("2d");

const muteButton = document.querySelector("#mute");

let soundEnabled = true;

// paper.onclick = () => {
//   soundEnabled = !soundEnabled;
// };

document.onvisibilitychange = () => (soundEnabled = false);

const startTime = new Date().getTime();

const calculateNextImpactTime = (currentImpactTime, velocity) => {
  return currentImpactTime + (Math.PI / velocity) * 1000;
};

const arcs = [
  "#D0E7F5",
  "#D9E7F4",
  "#D6E3F4",
  "#BCDFF5",
  "#B7D9F4",
  "#C3D4F0",
  "#9DC1F3",
  "#9AA9F4",
  "#8D83EF",
  "#AE69F0",
  "#D46FF1",
  "#DB5AE7",
  "#D911DA",
  "#D601CB",
  "#E713BF",
  "#F24CAE",
  "#FB79AB",
  "#FFB6C1",
  "#FED2CF",
  "#FDDFD5",
  "#FEDCD1",
].map((color, index) => {
  const audio = new Audio(`/sounds/key-${index}.mp3`);

  audio.volume = 0.2;

  const oneFullLoop = 2 * Math.PI;
  const maxLoops = 40;
  const numberOfLoops = oneFullLoop * (maxLoops - index);
  const velocity = numberOfLoops / 300;

  return {
    color,
    audio,
    nextImpactTime: calculateNextImpactTime(startTime, velocity),
    velocity,
  };
});

const draw = () => {
  const currentTime = new Date().getTime(),
    elapsedTime = (currentTime - startTime) / 1000;

  paper.width = paper.clientWidth;
  paper.height = paper.clientHeight;

  const start = {
    x: paper.width * 0.1,
    y: paper.height * 0.9,
  };

  const end = {
    x: paper.width * 0.9,
    y: paper.height * 0.9,
  };

  const center = {
    x: paper.width * 0.5,
    y: paper.height * 0.9,
  };

  pen.strokeStyle = "white";
  pen.lineWidth = 4;

  pen.beginPath();
  pen.moveTo(start.x, start.y);
  pen.lineTo(end.x, end.y);
  pen.stroke();

  const length = end.x - start.x;
  const initialArcRadius = length * 0.05;
  const spacing = (length / 2 - initialArcRadius) / arcs.length;

  arcs.forEach((arc, index) => {
    const arcRadius = initialArcRadius + index * spacing;

    //draw arc
    pen.beginPath();
    pen.strokeStyle = arc.color;
    pen.arc(center.x, center.y, arcRadius, Math.PI, 2 * Math.PI);
    pen.stroke();

    //draw circle
    const oneFullLoop = 2 * Math.PI;
    const maxLoops = 40;
    const numberOfLoops = oneFullLoop * (maxLoops - index);
    const velocity = numberOfLoops / 300;
    const maxAngle = 2 * Math.PI;
    const distance = Math.PI + elapsedTime * velocity;
    const modDistance = distance % maxAngle;
    const adjustedDistance =
      modDistance >= Math.PI ? modDistance : maxAngle - distance;

    const x = center.x + arcRadius * Math.cos(adjustedDistance),
      y = center.y + arcRadius * Math.sin(adjustedDistance);

    pen.fillStyle = "white";
    pen.beginPath();
    pen.arc(x, y, length * 0.008, 0, 2 * Math.PI);
    pen.fill();

    if (soundEnabled && currentTime >= arc.nextImpactTime) {
      arc.audio.play();
      updateNextImpactTime(arc);
    }
  });

  requestAnimationFrame(draw);
};

const updateNextImpactTime = (arc) => {
  arc.nextImpactTime = calculateNextImpactTime(
    arc.nextImpactTime,
    arc.velocity
  );
};

draw();

muteButton.onclick = () => {
  soundEnabled = !soundEnabled;
  muteButton.innerHTML = soundEnabled ? "Mute" : "Unmute";

  if (soundEnabled) {
    arcs[0].audio.play(); // Play a sound to ensure browser policy is satisfied
  }
};
