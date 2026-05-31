import * as THREE from "three";

// Simplex 3D Noise GLSL helper
export const simplexNoiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const CrystalShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color("#34d399") },
    uGlowColor: { value: new THREE.Color("#059669") },
    uMorphState: { value: 0.0 }, // 0: Liquid, 1: Grids, 2: Crystal Key, 3: Deduction Nodes, 4: GPGPU Particles
    uNoiseFreq: { value: 1.2 },
    uNoiseAmp: { value: 0.15 },
    uPulse: { value: 0.0 },
    uBgTexture: { value: null }, // FBO target texture
    uResolution: { value: new THREE.Vector2(800, 600) },
    uMouse: { value: new THREE.Vector2(0, 0) },
  },
  
  vertexShader: `
    uniform float uTime;
    uniform float uNoiseFreq;
    uniform float uNoiseAmp;
    uniform float uMorphState; // Interpolates between morph profiles
    uniform float uPulse;
    uniform vec2 uMouse;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec4 vScreenPosition;
    varying float vNoiseVal;
    varying vec3 vModelPosition;

    ${simplexNoiseGLSL}

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec3 pos = position;
      
      // Dynamic noise displacement
      float noise = snoise(pos * uNoiseFreq + uTime * 0.5) * uNoiseAmp * (1.0 + uPulse * 0.5);
      vNoiseVal = noise;

      // Morph profile calculations
      // State 0: Amorphous liquid glass (highly displaced)
      vec3 liquidPos = pos + normal * noise;

      // State 1: Sharp crystal geometric structure (stiff noise, hard edge displacement)
      float shardNoise = step(0.1, snoise(pos * 3.0 + uTime * 0.1)) * 0.18;
      vec3 crystalPos = pos + normal * shardNoise;

      // State 2: Time Grids (Flat holographic alignment)
      vec3 gridPos = vec3(pos.x * 1.3, pos.y * 1.1, pos.z * 0.15);

      // Perform smooth multi-stage morph based on uMorphState uniform
      vec3 targetPos = liquidPos;
      if (uMorphState < 1.0) {
        targetPos = mix(liquidPos, gridPos, uMorphState);
      } else if (uMorphState < 2.0) {
        targetPos = mix(gridPos, crystalPos, uMorphState - 1.0);
      } else {
        // Fallback or node deduction state morphing
        vec3 nodePos = pos * (1.2 + sin(uTime * 1.5 + pos.y * 5.0) * 0.1);
        targetPos = mix(crystalPos, nodePos, clamp(uMorphState - 2.0, 0.0, 1.0));
      }

      vec4 modelPos = modelMatrix * vec4(targetPos, 1.0);
      vModelPosition = modelPos.xyz;

      // Dynamic mouse repulsion deform
      float distToMouse = distance(modelPos.xy, uMouse * 4.0);
      if (distToMouse < 2.5) {
        float factor = smoothstep(2.5, 0.0, distToMouse);
        modelPos.xyz += vec3(vNormal.xy, 0.0) * factor * 0.25;
      }

      vec4 mvPosition = viewMatrix * modelPos;
      vViewPosition = -mvPosition.xyz;
      
      vScreenPosition = projectionMatrix * mvPosition;
      gl_Position = vScreenPosition;
    }
  `,

  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uGlowColor;
    uniform float uPulse;
    uniform sampler2D uBgTexture;
    uniform vec2 uResolution;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec4 vScreenPosition;
    varying float vNoiseVal;
    varying vec3 vModelPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      // 1. Fresnel glow outline
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);

      // 2. Real-time FBO background refraction with Chromatic Aberration
      vec2 uv = (vScreenPosition.xy / vScreenPosition.w) * 0.5 + 0.5;
      
      // Optically distort uv mapping based on normal and noise
      vec2 refractionOffset = normal.xy * 0.06 * (1.0 + vNoiseVal * 1.2);
      
      // Sample 3 color channels with offsets to simulate spectral refraction (Chromatic Aberration)
      float r = texture2D(uBgTexture, uv - refractionOffset * 1.0).r;
      float g = texture2D(uBgTexture, uv - refractionOffset * 1.08).g;
      float b = texture2D(uBgTexture, uv - refractionOffset * 1.15).b;
      vec3 refractedColor = vec3(r, g, b);

      // 3. Complex HSL-tailored blend
      vec3 finalColor = mix(refractedColor, uBaseColor, 0.15);
      
      // Inject glowing Fresnel highlights
      finalColor += mix(vec3(0.0), uGlowColor, fresnel * 0.85);

      // Glowing peak highlight
      finalColor += uGlowColor * uPulse * 0.45;

      // Add elegant noise highlights
      finalColor += vec3(vNoiseVal * 0.08);

      // Absolute premium class translucency alpha
      float alpha = clamp(0.38 + fresnel * 0.58 + uPulse * 0.15, 0.0, 1.0);

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};
