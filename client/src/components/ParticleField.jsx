import { useEffect, useRef } from "react";

/**
 * Canvas-based ambient field: a loose lattice of nodes that drifts on its
 * own and bends toward the pointer, with velocity-scaled connective lines:
 * the "career network" motif running quietly behind every stage.
 */
export default function ParticleField({ density = 70, className = "" }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ nodes: [], pointer: { x: -9999, y: -9999, vx: 0, vy: 0 } });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / (14000 / (density / 70)));
      stateRef.current.nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.4 + 0.4,
      }));
    }

    function onPointerMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const p = stateRef.current.pointer;
      p.vx = x - p.x;
      p.vy = y - p.y;
      p.x = x;
      p.y = y;
    }

    function tick() {
      const { nodes, pointer } = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      const speed = Math.min(Math.hypot(pointer.vx, pointer.vy), 40);
      const reach = 130 + speed * 2.2;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < reach) {
          const pull = ((reach - dist) / reach) * 0.6;
          n.x += (dx / (dist || 1)) * pull;
          n.y += (dy / (dist || 1)) * pull;
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 95) {
            ctx.strokeStyle = `rgba(139, 124, 246, ${0.12 * (1 - d / 95)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const dx = n.x - pointer.x;
        const dy = n.y - pointer.y;
        const near = Math.hypot(dx, dy) < reach;
        ctx.fillStyle = near ? "rgba(95, 212, 214, 0.85)" : "rgba(238, 240, 244, 0.35)";
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      pointer.vx *= 0.9;
      pointer.vy *= 0.9;
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={className} />;
}
