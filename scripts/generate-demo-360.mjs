#!/usr/bin/env node
/**
 * Generates a DEMONSTRATION 360° frame sequence (36 SVG frames) by rendering a simple low-poly car model
 * at 10° increments. It exists only so the Vehicle360Viewer can be exercised before real captures exist.
 * It is watermarked "DEMO" and must never be presented as photos of an actual vehicle.
 *
 *   node scripts/generate-demo-360.mjs [frameCount=36]
 *
 * Real vehicles need a properly captured sequence — see docs/360-MEDIA.md.
 */
import fs from "node:fs";
import path from "node:path";

const N = Number(process.argv[2] ?? 36);
const OUT = path.resolve("public/360/demo");
const W = 960, H = 540, SCALE = 150, CX = W / 2, CY = 330;
const EL = (16 * Math.PI) / 180; // camera elevation
const YAW0 = (145 * Math.PI) / 180; // frame 0 = front three-quarter view
const cam = [0, -Math.cos(EL), Math.sin(EL)];
const right = [1, 0, 0];
const up = [0, Math.sin(EL), Math.cos(EL)];
const light = norm([0.35, -0.55, 0.75]);

function norm(v) { const l = Math.hypot(...v); return v.map((x) => x / l); }
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Side profiles (x forward, z up), listed counter-clockwise when viewed from +y.
const bodyProfile = [[-2.3, 0.32], [2.25, 0.32], [2.32, 0.6], [2.2, 0.8], [1.0, 0.98], [-1.2, 1.0], [-2.1, 0.96], [-2.3, 0.85]];
const cabinProfile = [[-1.18, 0.99], [1.0, 0.97], [0.32, 1.44], [-0.62, 1.42]];

const BODY = [214, 219, 224];
const GLASS = [30, 40, 52];
const TIRE = [22, 24, 28];
const RIM = [150, 158, 168];

function prism(profile, halfW, colorFor) {
  const faces = [];
  const L = profile.map(([x, z]) => [x, halfW, z]);
  const R = profile.map(([x, z]) => [x, -halfW, z]);
  faces.push({ pts: L, color: colorFor("side") });
  faces.push({ pts: [...R].reverse(), color: colorFor("side") });
  for (let i = 0; i < profile.length; i++) {
    const j = (i + 1) % profile.length;
    faces.push({ pts: [L[j], L[i], R[i], R[j]], color: colorFor("strip", profile[i], profile[j]) });
  }
  return faces;
}

function wheel(cx, cy, r, w) {
  const faces = [];
  const seg = 20;
  const outerY = cy + Math.sign(cy) * w / 2, innerY = cy - Math.sign(cy) * w / 2;
  const ring = (y, rad) => Array.from({ length: seg }, (_, k) => { const a = (k / seg) * Math.PI * 2; return [cx + Math.cos(a) * rad, y, r + Math.sin(a) * rad]; });
  const outer = ring(outerY, r), inner = ring(innerY, r);
  const o = cy > 0 ? outer : [...outer].reverse();
  faces.push({ pts: o, color: TIRE, decal: { pts: cy > 0 ? ring(outerY + Math.sign(cy) * 0.005, r * 0.62) : ring(outerY + Math.sign(cy) * 0.005, r * 0.62).reverse(), color: RIM } });
  for (let k = 0; k < seg; k++) {
    const k2 = (k + 1) % seg;
    const q = [outer[k], outer[k2], inner[k2], inner[k]];
    faces.push({ pts: cy > 0 ? q : q.reverse(), color: TIRE });
  }
  return faces;
}

const bodyFaces = prism(bodyProfile, 0.9, () => BODY);
const cabinFaces = prism(cabinProfile, 0.74, (kind, a, b) => (kind === "side" ? GLASS : a && b && a[1] > 1.38 && b[1] > 1.38 ? BODY : GLASS));
// Headlights / taillights as decals on the nose and tail strips.
for (const f of bodyFaces) {
  const xs = f.pts.map((p) => p[0]);
  if (f.pts.length === 4 && Math.min(...xs) > 2.19 && Math.max(...xs) > 2.3) {
    for (const s of [1, -1]) f.decals = [...(f.decals ?? []), { pts: [[2.3, s * 0.82, 0.66], [2.24, s * 0.82, 0.77], [2.24, s * 0.5, 0.78], [2.3, s * 0.5, 0.67]].map((p) => [p[0] + 0.012, p[1], p[2]]), color: [235, 238, 240], orient: s }];
  }
  if (f.pts.length === 4 && Math.max(...xs) < -2.29) {
    for (const s of [1, -1]) f.decals = [...(f.decals ?? []), { pts: [[-2.312, s * 0.85, 0.7], [-2.312, s * 0.85, 0.82], [-2.312, s * 0.5, 0.82], [-2.312, s * 0.5, 0.7]], color: [176, 20, 36], orient: s }];
  }
}
const faces = [...bodyFaces, ...cabinFaces, ...[[1.45, 0.86], [1.45, -0.86], [-1.45, 0.86], [-1.45, -0.86]].flatMap(([x, y]) => wheel(x, y, 0.34, 0.24))];

function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
function project(p) {
  const depth = dot(p, cam);
  const f = 12 / (12 - depth);
  return [CX + dot(p, right) * SCALE * f, CY - (dot(p, up) - 0.55) * SCALE * f, depth];
}
const shade = (c, n) => { const k = 0.52 + 0.48 * Math.max(0, dot(n, light)); return `rgb(${c.map((x) => Math.round(Math.min(255, x * k))).join(",")})`; };
// Profiles are wound so raw normals point inward; negate to get outward normals.
const faceNormal = (pts) => norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0]))).map((x) => -x);

fs.mkdirSync(OUT, { recursive: true });
for (let i = 0; i < N; i++) {
  const yaw = YAW0 + (i / N) * Math.PI * 2;
  const drawn = [];
  for (const face of faces) {
    const pts = face.pts.map((p) => rotZ(p, yaw));
    const n = faceNormal(pts);
    if (dot(n, cam) <= 0.001) continue; // back-face cull
    const pr = pts.map(project);
    const depth = pr.reduce((s, p) => s + p[2], 0) / pr.length;
    const polys = [{ d: pr, fill: shade(face.color, n) }];
    for (const dcl of [face.decal, ...(face.decals ?? [])].filter(Boolean)) {
      polys.push({ d: dcl.pts.map((p) => project(rotZ(p, yaw))), fill: shade(dcl.color, n) });
    }
    drawn.push({ depth, polys });
  }
  drawn.sort((a, b) => a.depth - b.depth);
  const poly = (d, fill) => `<polygon points="${d.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}" fill="${fill}" stroke="${fill}" stroke-width="0.6" stroke-linejoin="round"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><radialGradient id="bg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#f7f8fa"/><stop offset="1" stop-color="#dde2e8"/></radialGradient>
<radialGradient id="sh" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0b1220" stop-opacity=".35"/><stop offset="1" stop-color="#0b1220" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<ellipse cx="${CX}" cy="${CY + 0.55 * SCALE * Math.cos(EL) + 6}" rx="${SCALE * 2.7}" ry="${SCALE * 0.62}" fill="url(#sh)"/>
${drawn.flatMap((f) => f.polys.map((p) => poly(p.d, p.fill))).join("\n")}
<text x="${W - 24}" y="${H - 22}" text-anchor="end" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="3" fill="#0a1b33" fill-opacity=".45">DEMO 360 SEQUENCE · NOT A PHOTO OF THIS VEHICLE</text>
</svg>`;
  fs.writeFileSync(path.join(OUT, `frame-${String(i + 1).padStart(2, "0")}.svg`), svg);
}
console.log(`Wrote ${N} demo frames to ${path.relative(process.cwd(), OUT)}`);
