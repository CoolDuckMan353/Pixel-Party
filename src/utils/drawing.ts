export interface Point {
  x: number;
  y: number;
}

export function indexToPoint(index: number, gridSize: number): Point {
  return {
    x: index % gridSize,
    y: Math.floor(index / gridSize),
  };
}

export function pointToIndex(x: number, y: number, gridSize: number): number {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return -1;
  return y * gridSize + x;
}

export function bresenhamLine(x0: number, y0: number, x1: number, y1: number): Point[] {
  const points: Point[] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let currX = x0;
  let currY = y0;

  while (true) {
    points.push({ x: currX, y: currY });
    if (currX === x1 && currY === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currY += sy;
    }
  }

  return points;
}

export function getBrushPoints(center: Point, brushSize: number, gridSize: number): Point[] {
  const points: Point[] = [];
  const offset = Math.floor(brushSize / 2);

  for (let dy = 0; dy < brushSize; dy++) {
    for (let dx = 0; dx < brushSize; dx++) {
      const px = center.x - offset + dx;
      const py = center.y - offset + dy;
      if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
        points.push({ x: px, y: py });
      }
    }
  }

  return points;
}

export function floodFill(
  canvas: string[],
  startIndex: number,
  fillColor: string,
  gridSize: number
): { index: number; color: string }[] {
  if (startIndex < 0 || startIndex >= canvas.length) return [];
  const targetColor = canvas[startIndex] || '';
  if (targetColor.toLowerCase() === fillColor.toLowerCase()) return [];

  const changes: { index: number; color: string }[] = [];
  const visited = new Uint8Array(canvas.length);
  const queue: number[] = [startIndex];
  visited[startIndex] = 1;

  while (queue.length > 0) {
    const idx = queue.shift()!;
    changes.push({ index: idx, color: fillColor });

    const x = idx % gridSize;
    const y = Math.floor(idx / gridSize);

    const neighbors = [
      { nx: x + 1, ny: y },
      { nx: x - 1, ny: y },
      { nx: x, ny: y + 1 },
      { nx: x, ny: y - 1 },
    ];

    for (const { nx, ny } of neighbors) {
      if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
        const nIdx = ny * gridSize + nx;
        if (!visited[nIdx] && (canvas[nIdx] || '') === targetColor) {
          visited[nIdx] = 1;
          queue.push(nIdx);
        }
      }
    }
  }

  return changes;
}

export function rasterizeRect(
  p1: Point,
  p2: Point,
  filled: boolean,
  gridSize: number
): Point[] {
  const points: Point[] = [];
  const minX = Math.max(0, Math.min(p1.x, p2.x));
  const maxX = Math.min(gridSize - 1, Math.max(p1.x, p2.x));
  const minY = Math.max(0, Math.min(p1.y, p2.y));
  const maxY = Math.min(gridSize - 1, Math.max(p1.y, p2.y));

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (filled || x === minX || x === maxX || y === minY || y === maxY) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

export function rasterizeCircle(
  p1: Point,
  p2: Point,
  filled: boolean,
  gridSize: number
): Point[] {
  const points: Point[] = [];
  const radiusX = Math.abs(p2.x - p1.x);
  const radiusY = Math.abs(p2.y - p1.y);
  const radius = Math.max(radiusX, radiusY);
  const cx = p1.x;
  const cy = p1.y;

  const minX = Math.max(0, cx - radius);
  const maxX = Math.min(gridSize - 1, cx + radius);
  const minY = Math.max(0, cy - radius);
  const maxY = Math.min(gridSize - 1, cy + radius);

  const radSq = radius * radius;
  const innerRadSq = (radius - 1) * (radius - 1);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const distSq = (x - cx) * (x - cx) + (y - cy) * (y - cy);
      if (filled) {
        if (distSq <= radSq) {
          points.push({ x, y });
        }
      } else {
        if (distSq <= radSq && (distSq >= innerRadSq || radius <= 1)) {
          points.push({ x, y });
        }
      }
    }
  }

  return points;
}

export function shadeColor(colorHex: string, percent: number): string {
  if (!colorHex || colorHex === 'transparent') return colorHex;
  let num = parseInt(colorHex.replace('#', ''), 16);
  if (isNaN(num)) return colorHex;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function createEmptyCanvas(gridSize: number, bg: string = ''): string[] {
  return new Array(gridSize * gridSize).fill(bg);
}

export function exportCanvasToDataUrl(
  pixels: string[],
  gridSize: number,
  scale: number = 16,
  transparentBg: boolean = false
): string {
  const canvas = document.createElement('canvas');
  canvas.width = gridSize * scale;
  canvas.height = gridSize * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = false;

  if (!transparentBg) {
    ctx.fillStyle = '#1e1e2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  for (let i = 0; i < pixels.length; i++) {
    const color = pixels[i];
    if (color && color !== 'transparent') {
      const x = (i % gridSize) * scale;
      const y = Math.floor(i / gridSize) * scale;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, scale, scale);
    }
  }

  return canvas.toDataURL('image/png');
}
