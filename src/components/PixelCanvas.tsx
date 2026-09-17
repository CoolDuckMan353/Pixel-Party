import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  ToolType, 
  RemoteCursor, 
  PixelChange 
} from '../types/game';
import { 
  Point, 
  bresenhamLine, 
  getBrushPoints, 
  floodFill, 
  rasterizeRect, 
  rasterizeCircle, 
  shadeColor, 
  pointToIndex,
  indexToPoint 
} from '../utils/drawing';
import { soundEngine } from '../utils/audio';

interface PixelCanvasProps {
  gridSize: number;
  canvasPixels: string[];
  activeTool: ToolType;
  brushSize: number;
  primaryColor: string;
  secondaryColor: string;
  gridType: 'none' | 'subtle' | 'dots' | 'clear';
  zoom: number;
  panOffset: { x: number; y: number };
  symmetryMode: 'none' | 'horizontal' | 'vertical' | 'quad';
  isDrawingEnabled: boolean;
  remoteCursors: RemoteCursor[];
  onDrawStroke: (changes: PixelChange[]) => void;
  onPickColor: (color: string) => void;
  onCursorMove: (x: number, y: number) => void;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  gridSize,
  canvasPixels,
  activeTool,
  brushSize,
  primaryColor,
  secondaryColor,
  gridType,
  zoom,
  panOffset,
  symmetryMode,
  isDrawingEnabled,
  remoteCursors,
  onDrawStroke,
  onPickColor,
  onCursorMove,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [startShapePoint, setStartShapePoint] = useState<Point | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);
  const [previewPixels, setPreviewPixels] = useState<{ index: number; color: string }[]>([]);

  // Current stroke accumulator
  const currentStrokeRef = useRef<Map<number, string>>(new Map());

  // Convert client mouse/touch position to pixel coordinate (0 to gridSize-1)
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number): Point | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const rawX = (clientX - rect.left) / (rect.width / gridSize);
      const rawY = (clientY - rect.top) / (rect.height / gridSize);

      const px = Math.floor(rawX);
      const py = Math.floor(rawY);

      if (px < 0 || px >= gridSize || py < 0 || py >= gridSize) {
        return null;
      }
      return { x: px, y: py };
    },
    [gridSize]
  );

  // Apply symmetry to a set of points
  const applySymmetry = useCallback(
    (points: Point[]): Point[] => {
      if (symmetryMode === 'none') return points;

      const result: Point[] = [...points];
      const maxIdx = gridSize - 1;

      points.forEach((p) => {
        if (symmetryMode === 'horizontal' || symmetryMode === 'quad') {
          result.push({ x: maxIdx - p.x, y: p.y });
        }
        if (symmetryMode === 'vertical' || symmetryMode === 'quad') {
          result.push({ x: p.x, y: maxIdx - p.y });
        }
        if (symmetryMode === 'quad') {
          result.push({ x: maxIdx - p.x, y: maxIdx - p.y });
        }
      });

      return result;
    },
    [symmetryMode, gridSize]
  );

  // Render the canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // Background checkerboard for transparency
    const cellSize = 16;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isDark = (x + y) % 2 === 0;
        ctx.fillStyle = isDark ? '#181825' : '#1e1e2e';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // Draw authoritative canvas pixels
    for (let i = 0; i < canvasPixels.length; i++) {
      const color = canvasPixels[i];
      if (color && color !== 'transparent') {
        const pt = indexToPoint(i, gridSize);
        ctx.fillStyle = color;
        ctx.fillRect(pt.x * cellSize, pt.y * cellSize, cellSize, cellSize);
      }
    }

    // Overlay in-progress stroke changes
    for (const [idx, col] of currentStrokeRef.current.entries()) {
      const pt = indexToPoint(idx, gridSize);
      if (col && col !== 'transparent') {
        ctx.fillStyle = col;
        ctx.fillRect(pt.x * cellSize, pt.y * cellSize, cellSize, cellSize);
      } else {
        // Erasing back to checkerboard
        const isDark = (pt.x + pt.y) % 2 === 0;
        ctx.fillStyle = isDark ? '#181825' : '#1e1e2e';
        ctx.fillRect(pt.x * cellSize, pt.y * cellSize, cellSize, cellSize);
      }
    }

    // Overlay shape previews (line/rect/circle)
    for (const item of previewPixels) {
      const pt = indexToPoint(item.index, gridSize);
      ctx.fillStyle = item.color;
      ctx.fillRect(pt.x * cellSize, pt.y * cellSize, cellSize, cellSize);
    }

    // Draw Grid Lines if enabled
    if (gridType !== 'none') {
      if (gridType === 'subtle') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= gridSize; x++) {
          ctx.beginPath();
          ctx.moveTo(x * cellSize, 0);
          ctx.lineTo(x * cellSize, gridSize * cellSize);
          ctx.stroke();
        }
        for (let y = 0; y <= gridSize; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * cellSize);
          ctx.lineTo(gridSize * cellSize, y * cellSize);
          ctx.stroke();
        }
      } else if (gridType === 'clear') {
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= gridSize; x++) {
          ctx.beginPath();
          ctx.moveTo(x * cellSize, 0);
          ctx.lineTo(x * cellSize, gridSize * cellSize);
          ctx.stroke();
        }
        for (let y = 0; y <= gridSize; y++) {
          ctx.beginPath();
          ctx.moveTo(0, y * cellSize);
          ctx.lineTo(gridSize * cellSize, y * cellSize);
          ctx.stroke();
        }
      } else if (gridType === 'dots') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let x = 0; x <= gridSize; x++) {
          for (let y = 0; y <= gridSize; y++) {
            ctx.fillRect(x * cellSize - 0.5, y * cellSize - 0.5, 1, 1);
          }
        }
      }
    }

    // Draw Symmetry Guideline if active
    if (symmetryMode !== 'none') {
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      if (symmetryMode === 'horizontal' || symmetryMode === 'quad') {
        const midX = (gridSize / 2) * cellSize;
        ctx.beginPath();
        ctx.moveTo(midX, 0);
        ctx.lineTo(midX, gridSize * cellSize);
        ctx.stroke();
      }
      if (symmetryMode === 'vertical' || symmetryMode === 'quad') {
        const midY = (gridSize / 2) * cellSize;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(gridSize * cellSize, midY);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Draw Hover Brush Preview
    if (hoverPoint && isDrawingEnabled) {
      const brushPts = applySymmetry(getBrushPoints(hoverPoint, brushSize, gridSize));
      ctx.strokeStyle = activeTool === 'eraser' ? '#f43f5e' : '#a855f7';
      ctx.lineWidth = 1.5;

      brushPts.forEach((pt) => {
        ctx.strokeRect(pt.x * cellSize + 0.5, pt.y * cellSize + 0.5, cellSize - 1, cellSize - 1);
      });
    }
  }, [
    gridSize,
    canvasPixels,
    previewPixels,
    gridType,
    symmetryMode,
    hoverPoint,
    isDrawingEnabled,
    brushSize,
    activeTool,
    applySymmetry,
  ]);

  useEffect(() => {
    render();
  }, [render]);

  // Handle single action or point commit
  const processPoint = useCallback(
    (pt: Point, isRightClick: boolean = false) => {
      if (!isDrawingEnabled) return;

      const baseColor = isRightClick ? secondaryColor : primaryColor;
      const targetColor = activeTool === 'eraser' ? '' : baseColor;

      if (activeTool === 'eyedropper') {
        const idx = pointToIndex(pt.x, pt.y, gridSize);
        const sampled = canvasPixels[idx];
        if (sampled && sampled !== 'transparent') {
          onPickColor(sampled);
          soundEngine.playJoin();
        }
        return;
      }

      if (activeTool === 'bucket') {
        const idx = pointToIndex(pt.x, pt.y, gridSize);
        const changes = floodFill(canvasPixels, idx, targetColor, gridSize);
        if (changes.length > 0) {
          soundEngine.playBucketFill();
          onDrawStroke(changes);
        }
        return;
      }

      if (activeTool === 'shade_light' || activeTool === 'shade_dark') {
        const idx = pointToIndex(pt.x, pt.y, gridSize);
        const existing = canvasPixels[idx] || '#777777';
        const percent = activeTool === 'shade_light' ? 15 : -15;
        const shaded = shadeColor(existing, percent);
        currentStrokeRef.current.set(idx, shaded);
        soundEngine.playPixelDraw();
        render();
        return;
      }

      // Pencil / Eraser / Dither
      const pts = applySymmetry(getBrushPoints(pt, brushSize, gridSize));
      pts.forEach((p) => {
        const idx = pointToIndex(p.x, p.y, gridSize);
        if (idx !== -1) {
          if (activeTool === 'dither') {
            const isCheckered = (p.x + p.y) % 2 === 0;
            if (isCheckered) {
              currentStrokeRef.current.set(idx, targetColor);
            }
          } else {
            currentStrokeRef.current.set(idx, targetColor);
          }
        }
      });

      render();
    },
    [
      isDrawingEnabled,
      primaryColor,
      secondaryColor,
      activeTool,
      brushSize,
      gridSize,
      canvasPixels,
      onPickColor,
      onDrawStroke,
      applySymmetry,
      render,
    ]
  );

  // Mouse / Touch Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingEnabled) return;
    const pt = getCanvasCoords(e.clientX, e.clientY);
    if (!pt) return;

    setIsMouseDown(true);
    setLastPoint(pt);
    setStartShapePoint(pt);
    currentStrokeRef.current.clear();

    const isRightClick = e.button === 2;
    processPoint(pt, isRightClick);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e.clientX, e.clientY);
    setHoverPoint(pt);

    if (pt) {
      onCursorMove(pt.x, pt.y);
    }

    if (!isMouseDown || !pt || !isDrawingEnabled) {
      render();
      return;
    }

    const isRightClick = e.buttons === 2;
    const targetColor = activeTool === 'eraser' ? '' : isRightClick ? secondaryColor : primaryColor;

    // Handle Shape tools preview (Line, Rect, Circle)
    if (['line', 'rect', 'rect_filled', 'circle', 'circle_filled'].includes(activeTool) && startShapePoint) {
      let shapePoints: Point[] = [];
      if (activeTool === 'line') {
        shapePoints = bresenhamLine(startShapePoint.x, startShapePoint.y, pt.x, pt.y);
      } else if (activeTool === 'rect') {
        shapePoints = rasterizeRect(startShapePoint, pt, false, gridSize);
      } else if (activeTool === 'rect_filled') {
        shapePoints = rasterizeRect(startShapePoint, pt, true, gridSize);
      } else if (activeTool === 'circle') {
        shapePoints = rasterizeCircle(startShapePoint, pt, false, gridSize);
      } else if (activeTool === 'circle_filled') {
        shapePoints = rasterizeCircle(startShapePoint, pt, true, gridSize);
      }

      const symmetricalPoints = applySymmetry(shapePoints);
      const preview: { index: number; color: string }[] = [];
      symmetricalPoints.forEach((sp) => {
        const idx = pointToIndex(sp.x, sp.y, gridSize);
        if (idx !== -1) {
          preview.push({ index: idx, color: targetColor });
        }
      });
      setPreviewPixels(preview);
      return;
    }

    // Continuous brush stroke with Bresenham interpolation between lastPoint and pt
    if (lastPoint && (lastPoint.x !== pt.x || lastPoint.y !== pt.y)) {
      const linePoints = bresenhamLine(lastPoint.x, lastPoint.y, pt.x, pt.y);
      linePoints.forEach((lp) => {
        processPoint(lp, isRightClick);
      });
    } else {
      processPoint(pt, isRightClick);
    }

    setLastPoint(pt);
  };

  const handleMouseUp = () => {
    if (!isMouseDown || !isDrawingEnabled) return;
    setIsMouseDown(false);

    // If we were drawing a shape, commit preview to stroke
    if (previewPixels.length > 0) {
      previewPixels.forEach((item) => {
        currentStrokeRef.current.set(item.index, item.color);
      });
      setPreviewPixels([]);
    }

    // Commit current stroke changes to parent
    if (currentStrokeRef.current.size > 0) {
      const changes: PixelChange[] = [];
      for (const [index, color] of currentStrokeRef.current.entries()) {
        changes.push({ index, color });
      }
      onDrawStroke(changes);
      currentStrokeRef.current.clear();
      soundEngine.playPixelDraw();
    }

    setStartShapePoint(null);
    setLastPoint(null);
    render();
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingEnabled || e.touches.length === 0) return;
    const touch = e.touches[0];
    const pt = getCanvasCoords(touch.clientX, touch.clientY);
    if (!pt) return;

    setIsMouseDown(true);
    setLastPoint(pt);
    setStartShapePoint(pt);
    setHoverPoint(pt);
    currentStrokeRef.current.clear();
    processPoint(pt, false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMouseDown || !isDrawingEnabled || e.touches.length === 0) return;
    const touch = e.touches[0];
    const pt = getCanvasCoords(touch.clientX, touch.clientY);
    if (!pt) return;

    setHoverPoint(pt);
    onCursorMove(pt.x, pt.y);

    if (lastPoint && (lastPoint.x !== pt.x || lastPoint.y !== pt.y)) {
      const linePoints = bresenhamLine(lastPoint.x, lastPoint.y, pt.x, pt.y);
      linePoints.forEach((lp) => processPoint(lp, false));
    } else {
      processPoint(pt, false);
    }
    setLastPoint(pt);
  };

  const handleTouchEnd = () => {
    handleMouseUp();
    setHoverPoint(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full min-h-[380px] sm:min-h-[500px] overflow-hidden bg-[#0D0D0D] border border-[#222222] shadow-2xl touch-none select-none"
    >
      {/* Zoomable / Pannable Canvas Frame */}
      <div
        className="relative transition-transform duration-75 origin-center"
        style={{
          transform: `scale(${zoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={gridSize * 16}
          height={gridSize * 16}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoverPoint(null);
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="pixelated shadow-2xl border-2 border-[#333333] cursor-crosshair max-w-full max-h-[75vh] object-contain aspect-square"
          style={{ width: `${gridSize * 14}px`, height: `${gridSize * 14}px` }}
        />

        {/* Remote Collaborators Cursors */}
        {remoteCursors.map((cursor) => {
          const cellSize = 14;
          const left = cursor.x * cellSize;
          const top = cursor.y * cellSize;

          return (
            <div
              key={cursor.playerId}
              className="absolute pointer-events-none transition-all duration-100 z-20"
              style={{
                left: `${left}px`,
                top: `${top}px`,
              }}
            >
              {/* Cursor indicator */}
              <div
                className="w-3.5 h-3.5 border-2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
                style={{ borderColor: cursor.color, backgroundColor: `${cursor.color}44` }}
              />
              {/* Player Tag */}
              <div
                className="absolute left-3 top-2 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white whitespace-nowrap shadow-md"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.playerName}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coordinate & Tool HUD overlay bottom right */}
      <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-[#141414] border border-[#2A2A2A] text-[10px] font-mono-code font-bold text-neutral-300 pointer-events-none flex items-center gap-2 z-10">
        <span>GRID: {gridSize}×{gridSize}</span>
        <span>•</span>
        <span>
          X:{hoverPoint ? hoverPoint.x : '--'} Y:{hoverPoint ? hoverPoint.y : '--'}
        </span>
        <span>•</span>
        <span className="text-blue-400 uppercase font-black">{activeTool.replace('_', ' ')}</span>
      </div>
    </div>
  );
};
