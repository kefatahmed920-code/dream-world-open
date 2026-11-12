/**
 * Procedural PBR Texture Generator
 * Uses HTML5 2D Canvas to generate realistic aged timber, natural earth,
 * slate stone, mossy bark, water ripples, and normal maps in code.
 * Zero external 404 image dependencies.
 */

import * as THREE from 'three';

class TextureFactory {
  private cache: Map<string, THREE.Texture> = new Map();

  /**
   * Creates aged timber plank texture with realistic grain, knots, and nail markings
   * Matching prompt colors: #92734F (main aged), #604A35 (dark weathered), #B2966C (sunlit)
   */
  public getAgedWoodTexture(): THREE.Texture {
    const key = 'aged_wood';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base background with main aged wood
    ctx.fillStyle = '#92734F';
    ctx.fillRect(0, 0, 512, 512);

    // Plank count (horizontal planks)
    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      // Plank tone variation
      const toneVariation = (Math.random() - 0.5) * 20;
      ctx.fillStyle = `rgb(${146 + toneVariation}, ${115 + toneVariation * 0.8}, ${79 + toneVariation * 0.6})`;
      ctx.fillRect(0, y, 512, plankHeight - 2);

      // Wood grain lines
      for (let i = 0; i < 40; i++) {
        const lineY = y + Math.random() * (plankHeight - 2);
        ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(96, 74, 53, 0.45)' : 'rgba(178, 150, 108, 0.35)';
        ctx.lineWidth = 0.8 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        const cp1x = 128, cp1y = lineY + (Math.random() - 0.5) * 8;
        const cp2x = 384, cp2y = lineY + (Math.random() - 0.5) * 8;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, 512, lineY);
        ctx.stroke();
      }

      // Occasional wood knot
      if (Math.random() > 0.4) {
        const knotX = 80 + Math.random() * 350;
        const knotY = y + plankHeight * 0.5;
        ctx.fillStyle = '#604A35';
        ctx.beginPath();
        ctx.ellipse(knotX, knotY, 6, 4, Math.random() * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#4A3725';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Plank joint groove (dark shadow line)
      ctx.fillStyle = '#362719';
      ctx.fillRect(0, y + plankHeight - 2, 512, 2);

      // Staggered vertical plank cuts
      const cutX = (y * 3.7) % 512;
      ctx.fillStyle = '#2A1D13';
      ctx.fillRect(cutX, y, 2, plankHeight - 2);

      // Iron nail studs near ends
      ctx.fillStyle = '#202020';
      ctx.beginPath();
      ctx.arc(cutX + 10, y + 16, 2.5, 0, Math.PI * 2);
      ctx.arc(cutX + 10, y + plankHeight - 18, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Natural soil & earth texture
   * Earth colors: #786B50 (main earth), #A18B68 (light earth), #514B3C (damp earth)
   */
  public getNaturalEarthTexture(): THREE.Texture {
    const key = 'natural_earth';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base fill
    ctx.fillStyle = '#786B50';
    ctx.fillRect(0, 0, 512, 512);

    // Damp earth patches
    for (let i = 0; i < 24; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const radius = 30 + Math.random() * 60;
      const grad = ctx.createRadialGradient(rx, ry, 5, rx, ry, radius);
      grad.addColorStop(0, 'rgba(81, 75, 60, 0.7)');
      grad.addColorStop(1, 'rgba(81, 75, 60, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Light dry earth dusting
    for (let i = 0; i < 20; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const radius = 25 + Math.random() * 50;
      const grad = ctx.createRadialGradient(rx, ry, 5, rx, ry, radius);
      grad.addColorStop(0, 'rgba(161, 139, 104, 0.6)');
      grad.addColorStop(1, 'rgba(161, 139, 104, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Small gravel and pebbles embedded in soil
    for (let i = 0; i < 300; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const pr = 1 + Math.random() * 3;
      ctx.fillStyle = Math.random() > 0.5 ? '#8E8575' : '#4E483D';
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle mossy micro-dots in damp crevices
    ctx.fillStyle = 'rgba(78, 104, 62, 0.4)';
    for (let i = 0; i < 150; i++) {
      const mx = Math.random() * 512;
      const my = Math.random() * 512;
      ctx.fillRect(mx, my, 2 + Math.random() * 3, 2 + Math.random() * 3);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Weathered layered slate rock texture
   */
  public getSlateRockTexture(): THREE.Texture {
    const key = 'slate_rock';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#686B69';
    ctx.fillRect(0, 0, 512, 512);

    // Layered strata lines
    for (let y = 0; y < 512; y += 12 + Math.random() * 16) {
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(50, 52, 51, 0.6)' : 'rgba(140, 142, 138, 0.4)';
      ctx.lineWidth = 1 + Math.random() * 2.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y + (Math.random() - 0.5) * 10);
      ctx.stroke();
    }

    // Weathered fissures and cracks
    for (let i = 0; i < 15; i++) {
      ctx.strokeStyle = 'rgba(35, 37, 36, 0.7)';
      ctx.lineWidth = 1.2;
      let cx = Math.random() * 512;
      let cy = Math.random() * 512;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 5; s++) {
        cx += (Math.random() - 0.5) * 35;
        cy += (Math.random() - 0.5) * 20;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Moss patches for damp riverside stones
    for (let m = 0; m < 8; m++) {
      const mx = Math.random() * 512;
      const my = Math.random() * 512;
      const grad = ctx.createRadialGradient(mx, my, 2, mx, my, 28);
      grad.addColorStop(0, 'rgba(68, 92, 50, 0.65)');
      grad.addColorStop(1, 'rgba(68, 92, 50, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mx, my, 28, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Tree Bark Texture (weathered willow & pine)
   */
  public getBarkTexture(type: 'willow' | 'pine'): THREE.Texture {
    const key = `bark_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const baseColor = type === 'willow' ? '#5E5448' : '#4C3B30';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 512);

    // Deep vertical bark furrows
    for (let x = 0; x < 256; x += 6 + Math.random() * 8) {
      ctx.strokeStyle = 'rgba(30, 24, 18, 0.7)';
      ctx.lineWidth = 1.5 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      let curX = x;
      for (let y = 0; y < 512; y += 32) {
        curX += (Math.random() - 0.5) * 6;
        ctx.lineTo(curX, y);
      }
      ctx.stroke();
    }

    // Bark ridges highlights
    for (let x = 0; x < 256; x += 10 + Math.random() * 12) {
      ctx.strokeStyle = type === 'willow' ? 'rgba(125, 114, 98, 0.45)' : 'rgba(135, 96, 75, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 2, 0);
      ctx.lineTo(x + 2, 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Water Normal Map for high-fidelity waves & ripples
   */
  public getWaterNormalMap(): THREE.Texture {
    const key = 'water_normal';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Create height map in memory then compute normals
    const heightMap: number[][] = [];
    for (let y = 0; y < 256; y++) {
      heightMap[y] = [];
      for (let x = 0; x < 256; x++) {
        // Multi-frequency wave synthesis
        const nx = x / 256;
        const ny = y / 256;
        const w1 = Math.sin(nx * 12 * Math.PI) * Math.cos(ny * 10 * Math.PI);
        const w2 = Math.sin((nx + ny) * 16 * Math.PI) * 0.5;
        const w3 = Math.cos((nx - ny) * 24 * Math.PI) * 0.25;
        heightMap[y][x] = (w1 + w2 + w3) * 0.5 + 0.5;
      }
    }

    const imgData = ctx.createImageData(256, 256);
    const data = imgData.data;

    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const left = heightMap[y][(x - 1 + 256) % 256];
        const right = heightMap[y][(x + 1) % 256];
        const up = heightMap[(y - 1 + 256) % 256][x];
        const down = heightMap[(y + 1) % 256][x];

        const dx = (left - right) * 2.0;
        const dy = (up - down) * 2.0;
        const dz = 1.0;

        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const nx = dx / len;
        const ny = dy / len;
        const nz = dz / len;

        const idx = (y * 256 + x) * 4;
        data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
        data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
        data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Water Foam ring texture for dock pillars and river rocks
   */
  public getWaterFoamTexture(): THREE.Texture {
    const key = 'water_foam';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 128, 128);

    // Concentric frothy water ripple with bubbling specks
    const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(233, 240, 232, 0.85)');
    grad.addColorStop(0.5, 'rgba(233, 240, 232, 0.4)');
    grad.addColorStop(0.85, 'rgba(233, 240, 232, 0.15)');
    grad.addColorStop(1, 'rgba(233, 240, 232, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 60, 0, Math.PI * 2);
    ctx.fill();

    // Foam bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 12 + Math.random() * 45;
      const r = 0.8 + Math.random() * 2.2;
      ctx.beginPath();
      ctx.arc(64 + Math.cos(angle) * dist, 64 + Math.sin(angle) * dist, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Traditional Dhaka terracotta brick pattern for the preserved historic ghats
   */
  public getDhakaTerracottaBrickTexture(): THREE.Texture {
    const key = 'dhaka_brick';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich heritage terracotta tone
    ctx.fillStyle = '#A35338';
    ctx.fillRect(0, 0, 512, 512);

    const bh = 24;
    const bw = 54;
    for (let y = 0; y < 512; y += bh) {
      const offsetX = (Math.floor(y / bh) % 2) * (bw / 2);
      for (let x = -bw; x < 512 + bw; x += bw) {
        // Individual brick subtle tone
        const tone = (Math.random() - 0.5) * 22;
        ctx.fillStyle = `rgb(${163 + tone}, ${83 + tone * 0.6}, ${56 + tone * 0.4})`;
        ctx.fillRect(x + offsetX + 2, y + 2, bw - 4, bh - 4);
      }
      // Mortar line
      ctx.fillStyle = '#D6CEBE';
      ctx.fillRect(0, y, 512, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Monumental Ancient Chinese Bridge Timber Texture
   * Colors specified in prompt:
   *  - Main timber: #76563B
   *  - Weathered timber: #604A35
   *  - Sunlit timber: #A1845C
   *  - Dark structural wood: #40352B
   */
  public getAncientBridgeWoodTexture(): THREE.Texture {
    const key = 'bridge_wood';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base main timber tone #76563B
    ctx.fillStyle = '#76563B';
    ctx.fillRect(0, 0, 512, 512);

    // Weathered timber streaks and grain
    for (let i = 0; i < 70; i++) {
      const y = Math.random() * 512;
      ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(64, 53, 43, 0.45)' : 'rgba(161, 132, 92, 0.35)';
      ctx.lineWidth = 1 + Math.random() * 2.2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      const cp1y = y + (Math.random() - 0.5) * 12;
      const cp2y = y + (Math.random() - 0.5) * 12;
      ctx.bezierCurveTo(170, cp1y, 340, cp2y, 512, y);
      ctx.stroke();
    }

    // Heavy longitudinal plank joint lines
    for (let x = 0; x < 512; x += 64) {
      ctx.fillStyle = '#2B231C';
      ctx.fillRect(x, 0, 2, 512);

      // Wooden dowels / pegs along joints
      for (let y = 32; y < 512; y += 96) {
        ctx.fillStyle = '#1E1712';
        ctx.beginPath();
        ctx.arc(x + 16, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Traditional Chinese Curved Roof Tile Texture (Grey / Dark Charcoal Wa Tiles)
   */
  public getChineseRoofTileTexture(): THREE.Texture {
    const key = 'chinese_roof_tile';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base slate/charcoal
    ctx.fillStyle = '#2C3033';
    ctx.fillRect(0, 0, 512, 512);

    // Vertical ribbed cylindrical tile rows (Banwa & Tongwa)
    const rowWidth = 32;
    for (let x = 0; x < 512; x += rowWidth) {
      // Shading to simulate cylindrical convex curve
      const grad = ctx.createLinearGradient(x, 0, x + rowWidth, 0);
      grad.addColorStop(0, '#1E2124');
      grad.addColorStop(0.3, '#484F54');
      grad.addColorStop(0.7, '#383D42');
      grad.addColorStop(1, '#181A1C');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, rowWidth - 2, 512);

      // Horizontal tile overlapping lip shadows
      for (let y = 0; y < 512; y += 48) {
        ctx.fillStyle = 'rgba(15, 17, 18, 0.7)';
        ctx.fillRect(x, y, rowWidth - 2, 4);

        // Circular eave end tile motif (Wadang round medallion)
        ctx.strokeStyle = '#5E666D';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + rowWidth / 2 - 1, y + 24, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Vermilion / Cinnabar Red Lacquered Timber for Imperial Columns & Dougong
   */
  public getChineseLacqueredRedTexture(): THREE.Texture {
    const key = 'chinese_red_lacquer';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Imperial deep vermilion red
    ctx.fillStyle = '#8C241B';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle brushed wood grain with antique patina
    for (let y = 0; y < 256; y += 4) {
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(170, 50, 40, 0.4)' : 'rgba(90, 18, 12, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y + (Math.random() - 0.5) * 3);
      ctx.stroke();
    }

    // Gold fleck antique dusting
    ctx.fillStyle = 'rgba(212, 175, 55, 0.18)';
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Traditional Carved Wooden Lattice Balustrade Texture
   */
  public getCarvedLatticeTexture(): THREE.Texture {
    const key = 'carved_lattice';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#604A35';
    ctx.fillRect(0, 0, 256, 256);

    // Geometric Chinese screen fretwork
    ctx.strokeStyle = '#40352B';
    ctx.lineWidth = 4;
    const step = 32;
    for (let x = 0; x <= 256; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Inner diamond crosses
    ctx.strokeStyle = '#76563B';
    ctx.lineWidth = 2.5;
    for (let x = 0; x < 256; x += step) {
      for (let y = 0; y < 256; y += step) {
        ctx.beginPath();
        ctx.moveTo(x + step / 2, y);
        ctx.lineTo(x + step, y + step / 2);
        ctx.lineTo(x + step / 2, y + step);
        ctx.lineTo(x, y + step / 2);
        ctx.closePath();
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Imperial Yellow Glazed Roof Tiles (Forbidden Palace / Royal Hall Architecture)
   * Brilliant golden-amber glazed ceramic with Wadang circular medallions
   */
  public getImperialYellowRoofTileTexture(): THREE.Texture {
    const key = 'imperial_yellow_roof';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Imperial golden amber base
    ctx.fillStyle = '#C68B24';
    ctx.fillRect(0, 0, 512, 512);

    const rowWidth = 64;
    for (let x = 0; x < 512; x += rowWidth) {
      // Golden glaze gradient
      const grad = ctx.createLinearGradient(x, 0, x + rowWidth, 0);
      grad.addColorStop(0, '#8E5E14');
      grad.addColorStop(0.2, '#E5B138');
      grad.addColorStop(0.5, '#F9D868');
      grad.addColorStop(0.8, '#DDA328');
      grad.addColorStop(1, '#7C500E');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, 0, rowWidth - 4, 512);

      // Horizontal interlocking tile laps
      const tileH = 48;
      for (let y = 0; y < 512; y += tileH) {
        ctx.fillStyle = 'rgba(70, 42, 6, 0.45)';
        ctx.fillRect(x, y + tileH - 3, rowWidth, 3);

        // Glaze sheen highlight
        ctx.fillStyle = 'rgba(255, 250, 210, 0.35)';
        ctx.fillRect(x + 10, y + 2, rowWidth - 20, 2);

        // Circular imperial dragon/cloud medallion eave end
        ctx.strokeStyle = '#683F0C';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x + rowWidth / 2, y + 24, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Traditional Thatched Reed & Straw Roof Texture (Rural Village & Farmsteads)
   */
  public getThatchedRoofTexture(): THREE.Texture {
    const key = 'thatched_roof';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#8C7752';
    ctx.fillRect(0, 0, 256, 256);

    // Layered straw fibres
    for (let i = 0; i < 400; i++) {
      const sx = Math.random() * 256;
      const sy = Math.random() * 256;
      const len = 14 + Math.random() * 28;
      ctx.strokeStyle = Math.random() > 0.5 ? '#B5A072' : '#655436';
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + (Math.random() - 0.5) * 4, sy + len);
      ctx.stroke();
    }

    // Horizontal binding bands
    for (let y = 32; y < 256; y += 48) {
      ctx.fillStyle = 'rgba(54, 43, 26, 0.5)';
      ctx.fillRect(0, y, 256, 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Whitewashed Plaster Wall Texture (Jiangnan Water Towns & Siheyuan Courtyards)
   */
  public getWhitePlasterWallTexture(): THREE.Texture {
    const key = 'white_plaster_wall';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Pale chalky white-grey plaster base
    ctx.fillStyle = '#EAE7E1';
    ctx.fillRect(0, 0, 512, 512);

    // Weathering patches & moisture gradient at base
    for (let i = 0; i < 20; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const r = 30 + Math.random() * 70;
      const grad = ctx.createRadialGradient(rx, ry, 5, rx, ry, r);
      grad.addColorStop(0, 'rgba(195, 190, 180, 0.45)');
      grad.addColorStop(1, 'rgba(234, 231, 225, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vertical rainwater weathering streaks (iconic Chinese southern water-town patina)
    for (let x = 0; x < 512; x += 18 + Math.random() * 24) {
      const streakLength = 80 + Math.random() * 260;
      const startY = Math.random() * 120;
      const grad = ctx.createLinearGradient(x, startY, x, startY + streakLength);
      grad.addColorStop(0, 'rgba(120, 115, 105, 0.28)');
      grad.addColorStop(0.7, 'rgba(150, 145, 135, 0.15)');
      grad.addColorStop(1, 'rgba(234, 231, 225, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, startY, 4 + Math.random() * 8, streakLength);
    }

    // Fine plaster micro-stipple
    for (let i = 0; i < 600; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(160, 155, 145, 0.25)';
      ctx.fillRect(px, py, 1.5, 1.5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Dark Slate-Black Glazed Chinese Roof Tiles (Jiangnan Water Towns & Taoist Temples)
   */
  public getDarkGreyGlazedTileTexture(): THREE.Texture {
    const key = 'dark_grey_glazed_tile';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2A2C2E';
    ctx.fillRect(0, 0, 512, 512);

    const rowWidth = 48;
    for (let x = 0; x < 512; x += rowWidth) {
      const grad = ctx.createLinearGradient(x, 0, x + rowWidth, 0);
      grad.addColorStop(0, '#1E2022');
      grad.addColorStop(0.3, '#3B3E42');
      grad.addColorStop(0.7, '#484C52');
      grad.addColorStop(1, '#1A1C1D');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 2, 0, rowWidth - 4, 512);

      // Horizontal interlocking tile laps
      const tileH = 36;
      for (let y = 0; y < 512; y += tileH) {
        ctx.fillStyle = '#111213';
        ctx.fillRect(x, y + tileH - 2, rowWidth, 2);

        // Circular eave Wadang medallion
        ctx.strokeStyle = '#5E636A';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + rowWidth / 2, y + 18, 5.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Great Wall Stone Fortress Masonry Blocks
   */
  public getGreatWallStoneTexture(): THREE.Texture {
    const key = 'great_wall_stone';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#5A5B5A';
    ctx.fillRect(0, 0, 512, 512);

    const blockH = 32;
    const blockW = 64;
    for (let y = 0; y < 512; y += blockH) {
      const rowOffset = (Math.floor(y / blockH) % 2) * (blockW / 2);
      for (let x = -blockW; x < 512 + blockW; x += blockW) {
        const tone = (Math.random() - 0.5) * 24;
        ctx.fillStyle = `rgb(${90 + tone}, ${92 + tone}, ${90 + tone})`;
        ctx.fillRect(x + rowOffset + 2, y + 2, blockW - 4, blockH - 4);

        // Chiseled stone texture lines
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(40, 42, 40, 0.4)' : 'rgba(120, 122, 120, 0.3)';
          ctx.lineWidth = 1;
          const ly = y + 4 + Math.random() * (blockH - 8);
          ctx.beginPath();
          ctx.moveTo(x + rowOffset + 4, ly);
          ctx.lineTo(x + rowOffset + blockW - 4, ly + (Math.random() - 0.5) * 3);
          ctx.stroke();
        }
      }
      // Mortar groove line
      ctx.fillStyle = '#2D2E2D';
      ctx.fillRect(0, y + blockH - 2, 512, 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Chinese Spirit Wall (Yingbi) Carved Dragon & Peony Brick Relief
   */
  public getSpiritWallReliefTexture(): THREE.Texture {
    const key = 'spirit_wall_relief';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Rich terracotta/grey relief stone
    ctx.fillStyle = '#655C54';
    ctx.fillRect(0, 0, 512, 256);

    // Decorative geometric outer border
    ctx.strokeStyle = '#8E8276';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 492, 236);
    ctx.strokeStyle = '#3E3731';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, 480, 224);

    // Auspicious cloud swirls (Xiangyun)
    ctx.strokeStyle = '#A89B8B';
    ctx.lineWidth = 3;
    for (let cx = 60; cx <= 450; cx += 80) {
      for (let cy = 50; cy <= 200; cy += 70) {
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 1.5);
        ctx.arc(cx + 12, cy - 6, 12, Math.PI * 0.5, Math.PI * 1.8);
        ctx.stroke();
      }
    }

    // Central circular dragon / blessing emblem
    ctx.fillStyle = '#7C342C';
    ctx.beginPath();
    ctx.arc(256, 128, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Golden Dragon motif stylized curves
    ctx.strokeStyle = '#F0D478';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 128, 36, 0.4, Math.PI * 1.7);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Calligraphy Rice Paper Scroll Texture
   */
  public getCalligraphyScrollTexture(): THREE.Texture {
    const key = 'calligraphy_scroll';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Vintage Xuan paper tone
    ctx.fillStyle = '#F3EAD8';
    ctx.fillRect(0, 0, 256, 512);

    // Silk mounting borders (Top & Bottom brocade)
    ctx.fillStyle = '#395345';
    ctx.fillRect(0, 0, 256, 40);
    ctx.fillRect(0, 472, 256, 40);

    // Calligraphy strokes simulation (classical Chinese ink poem lines)
    ctx.fillStyle = '#1B1C1D';
    for (let col = 200; col >= 50; col -= 32) {
      for (let y = 60; y < 450; y += 28) {
        const h = 14 + Math.random() * 8;
        ctx.fillRect(col, y, 4, h);
        ctx.fillRect(col - 6, y + 4, 16, 3);
        if (Math.random() > 0.4) {
          ctx.beginPath();
          ctx.arc(col + 2, y + 14, 5, 0, Math.PI);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#1B1C1D';
          ctx.stroke();
        }
      }
    }

    // Red artist seal chops (Yinzhang)
    ctx.fillStyle = '#A32820';
    ctx.fillRect(195, 410, 16, 20);
    ctx.fillRect(40, 80, 14, 14);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Scholar Taihu Stone Karst Rockery Texture (太湖石)
   * Eroded porous limestone with characteristic holes, fissures, and mineral veins
   */
  public getTaihuRockTexture(): THREE.Texture {
    const key = 'taihu_rock';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#686B67';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle stone mottling
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const rRad = 4 + Math.random() * 24;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(75, 78, 74, 0.4)' : 'rgba(125, 128, 122, 0.35)';
      ctx.beginPath();
      ctx.arc(rx, ry, rRad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Karst solution pockets and hollows (characteristic of Taihu stones)
    for (let h = 0; h < 25; h++) {
      const hx = 30 + Math.random() * 450;
      const hy = 30 + Math.random() * 450;
      ctx.fillStyle = '#363835';
      ctx.beginPath();
      ctx.ellipse(hx, hy, 12 + Math.random() * 18, 8 + Math.random() * 12, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Han White Marble & Imperial Carved Stone Relief (汉白玉龙纹浮雕)
   * Fine-grained white stone with imperial cloud scrolls and dragon scale bas-relief
   */
  public getCarvedStoneReliefTexture(): THREE.Texture {
    const key = 'carved_stone_relief';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#E2DFD8';
    ctx.fillRect(0, 0, 512, 512);

    // Marble veins
    ctx.strokeStyle = 'rgba(195, 190, 180, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, 0);
      ctx.bezierCurveTo(
        Math.random() * 512, 170,
        Math.random() * 512, 340,
        Math.random() * 512, 512
      );
      ctx.stroke();
    }

    // Traditional swirling cloud scroll bas-relief (Xiangyun / 祥云)
    ctx.strokeStyle = '#B8B2A6';
    ctx.lineWidth = 2.5;
    for (let row = 40; row < 500; row += 80) {
      for (let col = 40; col < 500; col += 100) {
        ctx.beginPath();
        ctx.arc(col, row, 20, 0, Math.PI * 1.5);
        ctx.bezierCurveTo(col + 30, row - 20, col + 40, row + 10, col + 25, row + 20);
        ctx.bezierCurveTo(col + 10, row + 25, col - 15, row + 10, col - 20, row);
        ctx.stroke();
      }
    }

    // Outer relief border
    ctx.strokeStyle = '#9C968A';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 504);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }

  /**
   * Song Dynasty Fine Woven Silk Damask Banner & Fabric Texture (绫罗绸缎)
   */
  public getChineseSilkBannerTexture(): THREE.Texture {
    const key = 'chinese_silk_fabric';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich vermilion-madder silk base
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#8E281F');
    grad.addColorStop(0.5, '#B23A2E');
    grad.addColorStop(1, '#7C2119');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Fine jacquard weave cross-hatch
    ctx.strokeStyle = 'rgba(215, 175, 120, 0.22)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Golden Greek-key / thunder meander (Leiwen) border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 236, 492);
    ctx.strokeRect(16, 16, 224, 480);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, texture);
    return texture;
  }
}

export const textureFactory = new TextureFactory();


