/**
 * Pure Canvas 60fps Confetti burst with physics.
 * No external dependencies, pastel colors.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

const PASTEL_COLORS = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#14B8A6', // Teal
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#38BDF8', // Sky
];

export function launchConfetti(originX?: number, originY?: number, count: number = 24) {
  if (typeof window === 'undefined') return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    if (canvas.parentNode) document.body.removeChild(canvas);
    return;
  }
  const renderCtx: CanvasRenderingContext2D = ctx;

  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  renderCtx.scale(dpr, dpr);

  const startX = originX !== undefined ? originX : width / 2;
  const startY = originY !== undefined ? originY : height / 2;

  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = count > 30 ? Math.random() * 8 + 3 : Math.random() * 5 + 2;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (count > 30 ? 4 : 2),
      size: Math.random() * 6 + 4,
      color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      decay: Math.random() * 0.015 + 0.012,
    });
  }

  let animationFrameId: number;

  function render() {
    renderCtx.clearRect(0, 0, width, height);

    let activeParticles = 0;
    for (const p of particles) {
      if (p.opacity > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.rotationSpeed;
        p.opacity -= p.decay;

        renderCtx.save();
        renderCtx.translate(p.x, p.y);
        renderCtx.rotate((p.rotation * Math.PI) / 180);
        renderCtx.fillStyle = p.color;
        renderCtx.globalAlpha = Math.max(0, p.opacity);
        renderCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        renderCtx.restore();
      }
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrameId);
      if (canvas.parentNode) {
        document.body.removeChild(canvas);
      }
    }
  }

  animationFrameId = requestAnimationFrame(render);
}
