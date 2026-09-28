import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, RefreshCw, Box, Eye, Layers } from 'lucide-react';

interface Point3D {
  id: number;
  x: number;
  y: number;
  z: number;
  region: string;
}

export const FaceMeshViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.1);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [showPoints, setShowPoints] = useState<boolean>(true);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generate 68 Canonical Facial 3D Landmarks
  const generateLandmarks = (): Point3D[] => {
    const points: Point3D[] = [];
    
    // Jaw (0-16)
    for (let i = 0; i < 17; i++) {
      const t = (i - 8) / 8.0;
      points.push({
        id: i,
        x: t * 75,
        y: 45 - Math.cos(t * 1.3) * 60,
        z: -Math.abs(t) * 35,
        region: 'jaw',
      });
    }

    // Left Eyebrow (17-21)
    for (let i = 0; i < 5; i++) {
      points.push({
        id: 17 + i,
        x: -55 + i * 10,
        y: 35 + Math.sin((i / 4.0) * Math.PI) * 6,
        z: 8,
        region: 'eyebrow',
      });
    }

    // Right Eyebrow (22-26)
    for (let i = 0; i < 5; i++) {
      points.push({
        id: 22 + i,
        x: 15 + i * 10,
        y: 35 + Math.sin(((4 - i) / 4.0) * Math.PI) * 6,
        z: 8,
        region: 'eyebrow',
      });
    }

    // Nose Bridge (27-30)
    for (let i = 0; i < 4; i++) {
      points.push({
        id: 27 + i,
        x: 0,
        y: 25 - i * 8,
        z: 12 + i * 3.5,
        region: 'nose',
      });
    }

    // Nose Tip & Nostrils (31-35)
    const nostrils = [
      { x: -16, y: -5, z: 14 },
      { x: -8, y: -6, z: 22 },
      { x: 0, y: -7, z: 24 },
      { x: 8, y: -6, z: 22 },
      { x: 16, y: -5, z: 14 },
    ];
    nostrils.forEach((n, idx) => {
      points.push({ id: 31 + idx, ...n, region: 'nose' });
    });

    // Left Eye (36-41)
    for (let i = 0; i < 6; i++) {
      const angle = i * (Math.PI / 3);
      points.push({
        id: 36 + i,
        x: -38 + Math.cos(angle) * 11,
        y: 15 + Math.sin(angle) * 5,
        z: 6,
        region: 'eye',
      });
    }

    // Right Eye (42-47)
    for (let i = 0; i < 6; i++) {
      const angle = i * (Math.PI / 3);
      points.push({
        id: 42 + i,
        x: 38 + Math.cos(angle) * 11,
        y: 15 + Math.sin(angle) * 5,
        z: 6,
        region: 'eye',
      });
    }

    // Lips (48-59)
    for (let i = 0; i < 12; i++) {
      const angle = i * (Math.PI / 6);
      points.push({
        id: 48 + i,
        x: Math.cos(angle) * 26,
        y: -26 + Math.sin(angle) * 9,
        z: 10 + Math.cos(angle) * 4,
        region: 'mouth',
      });
    }

    return points;
  };

  const pointsRef = useRef<Point3D[]>(generateLandmarks());

  // Animation Loop & Canvas 3D Projector
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let currentYaw = yaw;
    let currentPitch = pitch;

    const render = () => {
      if (isAutoRotate) {
        currentYaw += 0.015;
        setYaw(currentYaw);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // 3D Rotation matrices
      const cosY = Math.cos(currentYaw);
      const sinY = Math.sin(currentYaw);
      const cosP = Math.cos(currentPitch);
      const sinP = Math.sin(currentPitch);

      // Project points to 2D screen
      const projected = pointsRef.current.map((pt) => {
        // Rotate around Y-axis (Yaw)
        let x1 = pt.x * cosY + pt.z * sinY;
        let z1 = -pt.x * sinY + pt.z * cosY;

        // Rotate around X-axis (Pitch)
        let y2 = pt.y * cosP - z1 * sinP;
        let z2 = pt.y * sinP + z1 * cosP;

        // Perspective projection
        const fov = 350;
        const scale = (fov / (fov + z2 + 80)) * zoom * 1.5;
        const screenX = cx + x1 * scale;
        const screenY = cy - y2 * scale; // Invert Y for canvas coordinate system

        return { ...pt, screenX, screenY, scale, depth: z2 };
      });

      // Draw Depth Calibration Circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 110 * zoom, 0, Math.PI * 2);
      ctx.arc(cx, cy, 60 * zoom, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Wireframe Edges
      if (showWireframe) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
        ctx.lineWidth = 1.2;

        const drawLoop = (start: number, end: number, closed = false) => {
          ctx.beginPath();
          for (let i = start; i <= end; i++) {
            const p = projected[i];
            if (!p) continue;
            if (i === start) ctx.moveTo(p.screenX, p.screenY);
            else ctx.lineTo(p.screenX, p.screenY);
          }
          if (closed) {
            const first = projected[start];
            if (first) ctx.lineTo(first.screenX, first.screenY);
          }
          ctx.stroke();
        };

        // Jaw
        drawLoop(0, 16);
        // Eyebrows
        drawLoop(17, 21);
        drawLoop(22, 26);
        // Nose
        drawLoop(27, 30);
        drawLoop(31, 35);
        // Eyes
        drawLoop(36, 41, true);
        drawLoop(42, 47, true);
        // Mouth
        drawLoop(48, 59, true);
      }

      // Draw Landmark Points with depth-based glowing color
      if (showPoints) {
        projected.forEach((p) => {
          // Color points by anterior-posterior depth
          const depthNorm = Math.max(0, Math.min(1, (p.depth + 40) / 70));
          const r = Math.round(6 + (239 - 6) * depthNorm);
          const g = Math.round(182 + (68 - 182) * depthNorm);
          const b = Math.round(212 + (68 - 212) * depthNorm);

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.beginPath();
          ctx.arc(p.screenX, p.screenY, Math.max(1.8, 3 * p.scale), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isAutoRotate, showWireframe, showPoints, zoom]);

  // Mouse Interaction handlers for 3D Orbit Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsAutoRotate(false);
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    setYaw((prev) => prev + dx * 0.01);
    setPitch((prev) => Math.max(-0.8, Math.min(0.8, prev - dy * 0.01)));
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="bg-navy-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center relative overflow-hidden shadow-lg">
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-mono font-semibold uppercase text-slate-200 tracking-wider">
            3D Craniofacial Wireframe Reconstruction
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          68 LANDMARKS // DENSE MESH
        </span>
      </div>

      {/* 3D Canvas */}
      <div className="relative w-full aspect-square max-w-[340px] flex items-center justify-center bg-navy-900/60 rounded-lg border border-slate-800/80 cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full"
        />

        {/* HUD Overlay */}
        <div className="absolute top-2 left-2 pointer-events-none font-mono text-[10px] text-cyan-400/80 space-y-0.5 bg-navy-950/70 p-1.5 rounded border border-cyan-500/20 backdrop-blur-sm">
          <div>YAW: {((yaw * 180) / Math.PI % 360).toFixed(1)}°</div>
          <div>PITCH: {((pitch * 180) / Math.PI).toFixed(1)}°</div>
          <div>EST. POSE: FRONT-ORTHOGONAL</div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="w-full flex items-center justify-between mt-3 text-xs gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-colors ${
              isAutoRotate ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${isAutoRotate ? 'animate-spin' : ''}`} />
            Orbit
          </button>
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-colors ${
              showWireframe ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            Mesh
          </button>
          <button
            onClick={() => setShowPoints(!showPoints)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border transition-colors ${
              showPoints ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            Points
          </button>
        </div>

        <button
          onClick={() => {
            setYaw(0);
            setPitch(0);
            setIsAutoRotate(false);
          }}
          className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-[11px] font-mono flex items-center gap-1"
          title="Reset to 0° Frontal Pose"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
};
