import React, { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const vertexShader = `
  attribute float size;
  attribute vec3 customColor;
  attribute float randomOffset;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vMouseDistance;
  
  uniform float time;
  uniform vec3 mousePosition3D;
  uniform vec3 prevMousePosition3D;
  uniform float mouseInfluence;
  uniform float globalSize;
  uniform float chaosAmount;
  uniform float fluidViscosity;
  uniform float waveAmplitude;
  uniform vec3 dropPosition;
  uniform float dropTime;
  uniform float dropStrength;
  uniform float baseOpacity;
  uniform vec3 mouseInteractionColor;
  uniform float pulseStrength;
  uniform float pulseFrequency;
  uniform float pulseInterval;
  uniform float mouseInteractionRadius;
  uniform float mouseWaveStrength;
  uniform float mouseVortexStrength;
  uniform float mouseDragStrength;
  uniform float mousePushPullStrength;
  uniform float mouseColorInfluenceRadius;
  
  // Simple 3D noise function for organic movement
  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float n = i.x + i.y * 57.0 + 113.0 * i.z;
    return mix(
      mix(mix(sin(n), sin(n + 1.0), f.x),
          mix(sin(n + 57.0), sin(n + 58.0), f.x), f.y),
      mix(mix(sin(n + 113.0), sin(n + 114.0), f.x),
          mix(sin(n + 170.0), sin(n + 171.0), f.x), f.y),
      f.z
    ) * 0.5 + 0.5;
  }
  void main() {
    vColor = customColor;
    
    vec3 pos = position;
    vec3 originalPos = pos;
    
    // Enhanced chaotic movement with noise
    float timeOffset = randomOffset * 6.28318;
    float chaos = chaosAmount * 1.0; // Increased chaos for more movement
    
    // Multi-layered noise for organic floating effect
    float noise1 = noise3D(pos * 0.5 + time * 0.15 + vec3(randomOffset * 10.0));
    float noise2 = noise3D(pos * 0.3 + time * 0.1 + vec3(randomOffset * 5.0));
    float noise3 = noise3D(pos * 0.8 + time * 0.2 + vec3(randomOffset * 15.0));
    
    // Combine noise layers for complex movement
    vec3 noiseDisplacement = vec3(
      noise1 * 2.0 - 1.0,
      noise2 * 2.0 - 1.0,
      noise3 * 2.0 - 1.0
    ) * chaos * 0.8;
    
    // Enhanced wave calculations with more variety
    float wave1 = sin(time * 0.8 + timeOffset + pos.y * 1.5 + noise1 * 2.0) * chaos;
    float wave2 = cos(time * 1.0 + timeOffset + pos.z * 1.3 + noise2 * 2.0) * chaos;
    float wave3 = sin(time * 1.2 + timeOffset + pos.x * 1.7 + noise3 * 2.0) * chaos;
    
    // Breathing/pulsing effect
    float pulse = sin(time * 0.5 + randomOffset * 6.28) * 0.3;
    vec3 pulseDirection = normalize(pos + vec3(0.001));
    
    // Orbital/swirling motion
    float swirl = time * 0.3 + randomOffset * 6.28;
    vec3 swirlOffset = vec3(
      cos(swirl) * sin(pos.y * 0.5),
      sin(swirl) * cos(pos.x * 0.5),
      cos(swirl + 1.57) * sin(pos.z * 0.5)
    ) * chaos * 0.6;
    
    // Apply all movement effects
    pos += vec3(wave1, wave2, wave3);
    pos += noiseDisplacement;
    pos += pulseDirection * pulse * chaos;
    pos += swirlOffset;
    
    // Continuous center pulse animation (similar to water drop effect)
    if (pulseStrength > 0.01) {
      // Calculate distance from center
      float distanceFromCenter = length(pos);
      
      // Create multiple pulse waves traveling outward
      float pulseTime = time * pulseFrequency;
      
      // Primary pulse wave
      float primaryPulse = mod(pulseTime, pulseInterval);
      float primaryRipple = primaryPulse * 4.0;
      float primaryWidth = 0.4 + primaryPulse * 0.2;
      float primaryDecay = 1.0 - (primaryPulse / pulseInterval);
      
      float primaryInfluence = exp(-abs(distanceFromCenter - primaryRipple) / primaryWidth);
      float primaryWave = sin((distanceFromCenter - primaryRipple) * 18.0) * 
                         primaryInfluence * 
                         pulseStrength * 
                         primaryDecay * 0.25;
      
      vec3 pulseDir = normalize(pos + vec3(0.001));
      pos += pulseDir * primaryWave;
      
      // Vertical component for the wave crest
      float waveHeight = cos((distanceFromCenter - primaryRipple) * 18.0) * 
                        primaryInfluence * 
                        pulseStrength * 
                        primaryDecay * 0.15;
      pos.z += waveHeight;
      
      // Surface tension oscillation in center
      if (distanceFromCenter < 1.8) {
        float centerAge = mod(primaryPulse, 1.0);
        float tensionFalloff = (1.8 - distanceFromCenter) / 1.8;
        float tensionOscillation = sin(centerAge * 12.0 + pulseTime * 3.0) * 
                                  (1.0 - centerAge) * 
                                  tensionFalloff * 
                                  pulseStrength * 0.12;
        
        pos.z += tensionOscillation;
      }
      
      // Capillary waves (fine ripples)
      float capillaryFreq = 25.0 + randomOffset * 10.0;
      float capillaryWave = sin(distanceFromCenter * capillaryFreq - pulseTime * 8.0) * 
                           pulseStrength * 0.05;
      
      pos += pulseDir * capillaryWave;
    }
    
    // Enhanced water drop effect with realistic physics
    if (dropStrength > 0.01) {
      float dropAge = time - dropTime;
      float distanceToDrop = length(pos - dropPosition);
      vec3 dropDirection = normalize(pos - dropPosition + vec3(0.001));
      
      // Phase 1: Initial Impact Splash (0.0 - 0.3s)
      if (dropAge < 0.3 && distanceToDrop < 2.5) {
        float impactIntensity = exp(-dropAge * 8.0) * (1.0 - distanceToDrop / 2.5);
        
        // Upward splash with gravity
        float upwardForce = impactIntensity * dropStrength * 0.8;
        float gravity = -9.8 * dropAge * dropAge * 0.02; // Realistic gravity
        float verticalDisplacement = upwardForce + gravity;
        
        // Radial explosion from impact point
        float radialForce = impactIntensity * dropStrength * 0.6;
        
        // Add some randomness for natural splash pattern
        float splashVariation = sin(randomOffset * 20.0 + dropAge * 15.0) * 0.3;
        
        pos += dropDirection * (radialForce + splashVariation * impactIntensity);
        pos.z += verticalDisplacement;
      }
      
      // Phase 2: Primary Ripple Wave (starts immediately, travels outward)
      float primaryRipple = dropAge * 4.0; // Ripple speed
      float primaryWidth = 0.4 + dropAge * 0.2; // Expanding width
      float primaryDecay = exp(-dropAge * 1.2);
      
      if (primaryDecay > 0.01) {
        float primaryInfluence = exp(-abs(distanceToDrop - primaryRipple) / primaryWidth);
        float primaryWave = sin((distanceToDrop - primaryRipple) * 18.0) * 
                           primaryInfluence * 
                           dropStrength * 
                           primaryDecay * 0.25;
        
        pos += dropDirection * primaryWave;
        
        // Vertical component for the wave crest
        float waveHeight = cos((distanceToDrop - primaryRipple) * 18.0) * 
                          primaryInfluence * 
                          dropStrength * 
                          primaryDecay * 0.15;
        pos.z += waveHeight;
      }
      
      // Phase 3: Secondary Ripple (follows primary, smaller amplitude)
      if (dropAge > 0.1) {
        float secondaryAge = dropAge - 0.1;
        float secondaryRipple = secondaryAge * 3.2;
        float secondaryWidth = 0.6;
        float secondaryDecay = exp(-secondaryAge * 0.8);
        
        if (secondaryDecay > 0.01) {
          float secondaryInfluence = exp(-abs(distanceToDrop - secondaryRipple) / secondaryWidth);
          float secondaryWave = sin((distanceToDrop - secondaryRipple) * 12.0) * 
                               secondaryInfluence * 
                               dropStrength * 
                               secondaryDecay * 0.15;
          
          pos += dropDirection * secondaryWave;
        }
      }
      
      // Phase 4: Surface Tension Oscillation (creates the "bounce back" effect)
      if (distanceToDrop < 1.8 && dropAge > 0.2 && dropAge < 1.2) {
        float tensionAge = dropAge - 0.2;
        float tensionFalloff = (1.8 - distanceToDrop) / 1.8;
        float tensionOscillation = sin(tensionAge * 12.0) * 
                                  exp(-tensionAge * 2.5) * 
                                  tensionFalloff * 
                                  dropStrength * 0.12;
        
        pos.z += tensionOscillation;
        
        // Subtle inward pull during surface tension
        float inwardPull = cos(tensionAge * 8.0) * 
                          exp(-tensionAge * 3.0) * 
                          tensionFalloff * 
                          dropStrength * 0.08;
        pos -= dropDirection * inwardPull;
      }
      
      // Phase 5: Capillary Waves (fine ripples on the surface)
      if (dropAge < 2.0) {
        float capillaryFreq = 25.0 + randomOffset * 10.0; // High frequency, varies per particle
        float capillaryDecay = exp(-dropAge * 1.8);
        float capillaryWave = sin(distanceToDrop * capillaryFreq - time * 8.0) * 
                             capillaryDecay * 
                             dropStrength * 
                             0.05;
        
        pos += dropDirection * capillaryWave;
      }
    }
    
    // Enhanced mouse interaction with stronger effects
    if (mouseInfluence > 0.01) {
      vec3 mousePos3D = mousePosition3D;
      float distanceToMouse = length(pos - mousePos3D);
      
      if (distanceToMouse < mouseInteractionRadius) {
        // Enhanced wave calculation with multiple frequencies
        float wave1 = sin(distanceToMouse * 3.0 - time * 4.0) * 
                     exp(-distanceToMouse * 0.5) * 
                     waveAmplitude * 
                     mouseInfluence * 
                     mouseWaveStrength;
        
        float wave2 = cos(distanceToMouse * 6.0 - time * 5.0) * 
                     exp(-distanceToMouse * 0.7) * 
                     waveAmplitude * 
                     mouseInfluence * 
                     (mouseWaveStrength * 0.5);
        
        vec3 waveDirection = normalize(pos - mousePos3D + vec3(0.001));
        
        // Stronger displacement
        pos += waveDirection * (wave1 + wave2);
        
        // Add spiral/vortex effect around mouse
        vec3 tangent = cross(waveDirection, vec3(0.0, 1.0, 0.0));
        float vortexStrength = exp(-distanceToMouse * 0.4) * mouseInfluence * mouseVortexStrength;
        pos += tangent * sin(time * 2.0 + distanceToMouse * 2.0) * vortexStrength;
        
        // Enhanced flow with drag
        vec3 mouseVelocity = (mousePos3D - prevMousePosition3D) * 30.0;
        float influence = exp(-distanceToMouse * 0.4) * mouseInfluence;
        pos += mouseVelocity * influence * fluidViscosity * mouseDragStrength;
        
        // Attraction/repulsion effect
        float pushPull = sin(time * 3.0 + randomOffset * 6.28) * mousePushPullStrength;
        pos += waveDirection * pushPull * influence;
      }
    }
    
    // Enhanced base water motion with more complexity
    float waterMotion1 = sin(time * 0.5 + originalPos.x + originalPos.y * 0.8) * 0.04;
    float waterMotion2 = cos(time * 0.3 + originalPos.z + originalPos.x * 0.6) * 0.03;
    pos.z += waterMotion1;
    pos.y += waterMotion2;
    
    // Add gentle drift away from sphere center
    float driftAmount = sin(time * 0.2 + randomOffset * 6.28) * 0.15;
    vec3 driftDirection = normalize(originalPos + vec3(
      sin(randomOffset * 10.0),
      cos(randomOffset * 8.0),
      sin(randomOffset * 12.0)
    ));
    pos += driftDirection * driftAmount * chaos;
    
    // Enhanced alpha calculation with realistic drop effects
    float movement = length(pos - originalPos);
    float mouseEffect = mouseInfluence * exp(-length(pos - mousePosition3D) * 0.8);
    
    // Continuous pulse effect on alpha
    float pulseEffect = 0.0;
    if (pulseStrength > 0.01) {
      float distanceFromCenter = length(pos);
      float pulseTime = time * pulseFrequency;
      
      // Primary pulse glow
      float primaryPulse = mod(pulseTime, pulseInterval);
      float primaryRipple = primaryPulse * 4.0;
      float rippleProximity = abs(distanceFromCenter - primaryRipple);
      if (rippleProximity < 0.6) {
        float primaryDecay = 1.0 - (primaryPulse / pulseInterval);
        float rippleGlow = exp(-rippleProximity * 3.0) * pulseStrength * primaryDecay;
        pulseEffect += rippleGlow * 0.4;
      }
      
      // Center glow
      if (distanceFromCenter < 1.8) {
        float centerGlow = (1.8 - distanceFromCenter) / 1.8 * pulseStrength;
        pulseEffect += centerGlow * 0.2;
      }
    }
    
    float dropEffect = 0.0;
    if (dropStrength > 0.01) {
      float dropAge = time - dropTime;
      float distanceToDrop = length(pos - dropPosition);
      
      // Splash zone - brighter, more visible particles
      if (distanceToDrop < 2.0 && dropAge < 0.4) {
        float splashAlpha = exp(-distanceToDrop * 0.8) * dropStrength * exp(-dropAge * 3.0);
        dropEffect += splashAlpha * 0.8;
      }
      
      // Primary ripple glow
      float primaryRipple = dropAge * 4.0;
      float rippleProximity = abs(distanceToDrop - primaryRipple);
      if (rippleProximity < 0.6) {
        float rippleGlow = exp(-rippleProximity * 3.0) * dropStrength * exp(-dropAge * 1.2);
        dropEffect += rippleGlow * 0.4;
      }
      
      // Secondary ripple glow
      if (dropAge > 0.1) {
        float secondaryAge = dropAge - 0.1;
        float secondaryRipple = secondaryAge * 3.2;
        float secondaryProximity = abs(distanceToDrop - secondaryRipple);
        if (secondaryProximity < 0.8) {
          float secondaryGlow = exp(-secondaryProximity * 2.0) * dropStrength * exp(-secondaryAge * 0.8);
          dropEffect += secondaryGlow * 0.3;
        }
      }
      
      // Surface tension area highlight
      if (distanceToDrop < 1.8 && dropAge > 0.2 && dropAge < 1.2) {
        float tensionGlow = (1.8 - distanceToDrop) / 1.8 * dropStrength * exp(-(dropAge - 0.2) * 2.0);
        dropEffect += tensionGlow * 0.2;
      }
    }
    
    // Dynamic color mixing based on mouse proximity
    float distanceToMouse = length(pos - mousePosition3D);
    vMouseDistance = distanceToMouse;
    
    // Calculate color influence based on distance and mouse influence
    float colorInfluenceRadius = mouseColorInfluenceRadius;
    float colorMixFactor = 0.0;
    
    if (mouseInfluence > 0.01 && distanceToMouse < colorInfluenceRadius) {
      // Smooth falloff from center
      float distanceFactor = 1.0 - (distanceToMouse / colorInfluenceRadius);
      distanceFactor = pow(distanceFactor, 2.0); // Quadratic falloff for smoother transition
      
      // Wave effect for dynamic color change
      float colorWave = sin(distanceToMouse * 2.0 - time * 3.0) * 0.5 + 0.5;
      
      colorMixFactor = distanceFactor * mouseInfluence * (0.7 + colorWave * 0.3);
    }
    
    // Add drop effect color influence
    if (dropStrength > 0.01) {
      float dropAge = time - dropTime;
      float distanceToDrop = length(pos - dropPosition);
      
      if (distanceToDrop < 3.0 && dropAge < 2.0) {
        float dropColorInfluence = exp(-distanceToDrop * 0.5) * dropStrength * exp(-dropAge * 1.0);
        colorMixFactor = max(colorMixFactor, dropColorInfluence * 0.6);
      }
    }
    
    // Mix original color with interaction color
    vColor = mix(customColor, mouseInteractionColor, colorMixFactor);
    
    vAlpha = clamp(baseOpacity + movement * 0.2 + pulseEffect + dropEffect + mouseEffect * 0.15, 0.1, 1.0);
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    
    // Enhanced size calculation with realistic drop particle scaling
    float dynamicSize = 1.0 + movement * 0.3 + mouseEffect * 0.15;
    
    // Continuous pulse effect on size
    if (pulseStrength > 0.01) {
      float distanceFromCenter = length(pos);
      float pulseTime = time * pulseFrequency;
      
      // Primary pulse size increase
      float primaryPulse = mod(pulseTime, pulseInterval);
      float primaryRipple = primaryPulse * 4.0;
      float rippleProximity = abs(distanceFromCenter - primaryRipple);
      if (rippleProximity < 0.4) {
        float primaryDecay = 1.0 - (primaryPulse / pulseInterval);
        float rippleSize = exp(-rippleProximity * 4.0) * pulseStrength * primaryDecay;
        dynamicSize += rippleSize * 0.6;
      }
      
      // Center pulse size variation
      if (distanceFromCenter < 1.8) {
        float centerPulse = sin(pulseTime * 3.0) * 
                           (1.8 - distanceFromCenter) / 1.8 * 
                           pulseStrength;
        dynamicSize += abs(centerPulse) * 0.4;
      }
    }
    
    if (dropStrength > 0.01) {
      float dropAge = time - dropTime;
      float distanceToDrop = length(pos - dropPosition);
      
      // Splash particles are significantly larger
      if (distanceToDrop < 2.5 && dropAge < 0.4) {
        float splashSize = exp(-distanceToDrop * 0.6) * dropStrength * exp(-dropAge * 2.5);
        dynamicSize += splashSize * 1.2;
      }
      
      // Ripple crest particles are moderately larger
      float primaryRipple = dropAge * 4.0;
      float rippleProximity = abs(distanceToDrop - primaryRipple);
      if (rippleProximity < 0.4) {
        float rippleSize = exp(-rippleProximity * 4.0) * dropStrength * exp(-dropAge * 1.5);
        dynamicSize += rippleSize * 0.6;
      }
      
      // Surface tension particles have pulsating size
      if (distanceToDrop < 1.8 && dropAge > 0.2 && dropAge < 1.2) {
        float tensionAge = dropAge - 0.2;
        float tensionPulse = abs(sin(tensionAge * 10.0)) * 
                            (1.8 - distanceToDrop) / 1.8 * 
                            dropStrength * 
                            exp(-tensionAge * 2.0);
        dynamicSize += tensionPulse * 0.4;
      }
    }
    
    gl_PointSize = size * globalSize * dynamicSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vMouseDistance;
  
  uniform float blurAmount;
  uniform float baseOpacity;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float r = length(center);
    
    if (r > 0.5) discard;
    
    // Optimized blur calculation
    float alpha;
    if (blurAmount > 0.8) {
      alpha = vAlpha * exp(-r * r * 3.0);
    } else if (blurAmount > 0.5) {
      alpha = vAlpha * (1.0 - r * r * 1.5);
    } else {
      alpha = vAlpha * (1.0 - smoothstep(0.2, 0.5, r));
    }
    
    alpha *= baseOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

interface ParticleSystemProps {
  color?: string;
  particleCount?: number;
  particleSize?: number;
  blurAmount?: number;
  sizeVariation?: number;
  chaosAmount?: number;
  fluidViscosity?: number;
  waveAmplitude?: number;
  opacity?: number;
  mouseInteractionColor?: string;
  pulseStrength?: number;
  pulseFrequency?: number;
  pulseInterval?: number;
  // Mouse interaction controls
  mouseInteractionRadius?: number;
  mouseWaveStrength?: number;
  mouseVortexStrength?: number;
  mouseDragStrength?: number;
  mousePushPullStrength?: number;
  mouseEnterSpeed?: number;
  mouseExitSpeed?: number;
  mouseColorInfluenceRadius?: number;
  // Click interaction controls
  clickStrength?: number;
  clickRandomness?: number;
  maxConcurrentClicks?: number;
}

function ParticleSystem({
  color = "#4a90e2",
  particleCount = 6000, // Reduced for better performance
  particleSize = 1.5,
  blurAmount = 0.6,
  sizeVariation = 0.5,
  chaosAmount = 0.25,
  fluidViscosity = 0.4,
  waveAmplitude = 0.3,
  opacity = 0.7,
  mouseInteractionColor = "#ff6b9d",

  // Pulse effect controls
  pulseStrength = 0.5,
  pulseFrequency = 0.5,
  pulseInterval = 6.0,

  // Mouse interaction controls with more aggressive defaults
  mouseInteractionRadius = 5.5,
  mouseWaveStrength = 1.2,
  mouseVortexStrength = 0.8,
  mouseDragStrength = 0.05,
  mousePushPullStrength = 0.6,
  mouseEnterSpeed = 0.2,
  mouseExitSpeed = 0.06,
  mouseColorInfluenceRadius = 4.5,

  // Click interaction controls
  clickStrength = 1.5,
  clickRandomness = 0.3,
  maxConcurrentClicks = 3,
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null);
  const particleGroupRef = useRef<THREE.Group>(null);
  const currentMousePos = useRef(new THREE.Vector3());
  const prevMousePos = useRef(new THREE.Vector3());
  const mouseInfluenceRef = useRef(0);
  const targetMouseInfluence = useRef(0);
  const lastMouseTime = useRef(0);
  const isMouseOverSphere = useRef(false);
  const frameCount = useRef(0);
  const mouseLeaveTimeoutRef = useRef<number | null>(null);

  // Click management refs
  const activeClicksRef = useRef<
    Array<{
      id: number;
      position: THREE.Vector3;
      startTime: number;
      strength: number;
    }>
  >([]);
  const nextClickId = useRef(0);

  const { raycaster, mouse, camera, gl } = useThree();

  // Optimized geometry creation with reduced complexity
  const [positions, colors, sizes, randomOffsets] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const randomOffsets = new Float32Array(particleCount);

    const colorObj = new THREE.Color(color);
    const radius = 3;

    // Use more efficient distribution
    for (let i = 0; i < particleCount; i++) {
      // Optimized sphere distribution
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * Math.cbrt(Math.random());

      const sinPhi = Math.sin(phi);
      positions[i * 3] = r * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Simplified color variation
      const variation = 0.08;
      const randVar = (Math.random() - 0.5) * variation;
      colors[i * 3] = Math.max(0, Math.min(1, colorObj.r + randVar));
      colors[i * 3 + 1] = Math.max(0, Math.min(1, colorObj.g + randVar));
      colors[i * 3 + 2] = Math.max(0, Math.min(1, colorObj.b + randVar));

      sizes[i] = 1 + (Math.random() - 0.5) * sizeVariation;
      randomOffsets[i] = Math.random();
    }

    return [positions, colors, sizes, randomOffsets];
  }, [particleCount, color, sizeVariation]);

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      mousePosition3D: { value: new THREE.Vector3() },
      prevMousePosition3D: { value: new THREE.Vector3() },
      mouseInfluence: { value: 0 },
      globalSize: { value: particleSize },
      blurAmount: { value: blurAmount },
      chaosAmount: { value: chaosAmount },
      fluidViscosity: { value: fluidViscosity },
      waveAmplitude: { value: waveAmplitude },
      dropPosition: { value: new THREE.Vector3() },
      dropTime: { value: 0 },
      dropStrength: { value: 0 },
      baseOpacity: { value: opacity },
      mouseInteractionColor: { value: new THREE.Color(mouseInteractionColor) },
      pulseStrength: { value: pulseStrength },
      pulseFrequency: { value: pulseFrequency },
      pulseInterval: { value: pulseInterval },
      mouseInteractionRadius: { value: mouseInteractionRadius },
      mouseWaveStrength: { value: mouseWaveStrength },
      mouseVortexStrength: { value: mouseVortexStrength },
      mouseDragStrength: { value: mouseDragStrength },
      mousePushPullStrength: { value: mousePushPullStrength },
      mouseColorInfluenceRadius: { value: mouseColorInfluenceRadius },
    }),
    [
      mouseInteractionColor,
      pulseStrength,
      pulseFrequency,
      pulseInterval,
      mouseInteractionRadius,
      mouseWaveStrength,
      mouseVortexStrength,
      mouseDragStrength,
      mousePushPullStrength,
      mouseColorInfluenceRadius,
    ]
  );

  // Update uniforms only when props change
  useEffect(() => {
    uniforms.globalSize.value = particleSize;
    uniforms.blurAmount.value = blurAmount;
    uniforms.chaosAmount.value = chaosAmount;
    uniforms.fluidViscosity.value = fluidViscosity;
    uniforms.waveAmplitude.value = waveAmplitude;
    uniforms.baseOpacity.value = opacity;
    uniforms.pulseStrength.value = pulseStrength;
    uniforms.pulseFrequency.value = pulseFrequency;
    uniforms.pulseInterval.value = pulseInterval;
    uniforms.mouseInteractionRadius.value = mouseInteractionRadius;
    uniforms.mouseWaveStrength.value = mouseWaveStrength;
    uniforms.mouseVortexStrength.value = mouseVortexStrength;
    uniforms.mouseDragStrength.value = mouseDragStrength;
    uniforms.mousePushPullStrength.value = mousePushPullStrength;
    uniforms.mouseColorInfluenceRadius.value = mouseColorInfluenceRadius;
  }, [
    particleSize,
    blurAmount,
    chaosAmount,
    fluidViscosity,
    waveAmplitude,
    opacity,
    pulseStrength,
    pulseFrequency,
    pulseInterval,
    mouseInteractionRadius,
    mouseWaveStrength,
    mouseVortexStrength,
    mouseDragStrength,
    mousePushPullStrength,
    mouseColorInfluenceRadius,
    uniforms,
  ]);

  const interactionSphere = useMemo(
    () => new THREE.SphereGeometry(3.5, 32, 32),
    []
  );

  // Enhanced mouse update function with smooth transitions
  const updateMousePosition = useCallback(
    (event: MouseEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.set(x, y);
      raycaster.setFromCamera(mouse, camera);

      // Create a mesh that rotates with the particle group
      if (particleGroupRef.current) {
        const tempMesh = new THREE.Mesh(interactionSphere);

        // Apply the same transformation as the particle group
        tempMesh.position.copy(particleGroupRef.current.position);
        tempMesh.rotation.copy(particleGroupRef.current.rotation);
        tempMesh.scale.copy(particleGroupRef.current.scale);
        tempMesh.updateMatrixWorld();

        const intersects = raycaster.intersectObject(tempMesh);

        if (intersects.length > 0) {
          // Mouse entered or is over the sphere
          if (!isMouseOverSphere.current) {
            // Just entered - smooth fade in
            isMouseOverSphere.current = true;
            gl.domElement.style.cursor = "pointer";
          }

          // Clear any pending leave timeout
          if (mouseLeaveTimeoutRef.current) {
            clearTimeout(mouseLeaveTimeoutRef.current);
            mouseLeaveTimeoutRef.current = null;
          }

          const point = intersects[0].point;

          // Transform the world space intersection point to local space
          const localPoint = point.clone();
          particleGroupRef.current.worldToLocal(localPoint);

          prevMousePos.current.copy(currentMousePos.current);
          currentMousePos.current.copy(localPoint);
          targetMouseInfluence.current = 1;
          lastMouseTime.current = Date.now();
        } else {
          // Mouse left the sphere
          if (isMouseOverSphere.current) {
            isMouseOverSphere.current = false;
            gl.domElement.style.cursor = "default";
            targetMouseInfluence.current = 0;

            // Set a timeout to ensure smooth fade out
            if (mouseLeaveTimeoutRef.current) {
              clearTimeout(mouseLeaveTimeoutRef.current);
            }
            mouseLeaveTimeoutRef.current = window.setTimeout(() => {
              targetMouseInfluence.current = 0;
            }, 100);
          }
        }
      }
    },
    [raycaster, mouse, camera, gl, interactionSphere]
  );

  // Enhanced event handlers with mouse leave detection
  useEffect(() => {
    const canvas = gl.domElement;
    let mouseMoveThrottle: number;
    let isThrottling = false;

    const throttledMouseMove = (event: MouseEvent) => {
      if (!isThrottling) {
        isThrottling = true;
        updateMousePosition(event);
        mouseMoveThrottle = window.setTimeout(() => {
          isThrottling = false;
        }, 16); // ~60fps throttling
      }
    };

    const handleMouseLeave = () => {
      // Mouse left the canvas entirely
      isMouseOverSphere.current = false;
      targetMouseInfluence.current = 0;
      canvas.style.cursor = "default";
    };

    const handleClick = (event: MouseEvent) => {
      updateMousePosition(event);

      if (isMouseOverSphere.current) {
        const currentTime = uniforms.time.value;

        // Remove oldest click if we're at max capacity
        if (activeClicksRef.current.length >= maxConcurrentClicks) {
          activeClicksRef.current.shift();
        }

        // The currentMousePos is already in local space from updateMousePosition
        const clickPosition = currentMousePos.current.clone();

        // Add enhanced randomization for more natural effect
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * clickRandomness,
          (Math.random() - 0.5) * clickRandomness,
          (Math.random() - 0.5) * clickRandomness
        );
        clickPosition.add(randomOffset);

        // Add variation to click strength for more organic feel
        const strengthVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const finalStrength = clickStrength * strengthVariation;

        // Create new click
        const newClick = {
          id: nextClickId.current++,
          position: clickPosition,
          startTime: currentTime,
          strength: finalStrength,
        };

        activeClicksRef.current.push(newClick);

        // Set initial drop effect (for backward compatibility)
        uniforms.dropPosition.value.copy(clickPosition);
        uniforms.dropTime.value = currentTime;
        uniforms.dropStrength.value = finalStrength;

        // Visual feedback - brief cursor change
        canvas.style.cursor = "grabbing";
        setTimeout(() => {
          if (isMouseOverSphere.current) {
            canvas.style.cursor = "pointer";
          }
        }, 150);

        // Enhanced animation with stronger initial impact
        const fadeStart = currentTime;
        const totalDuration = 4.5;

        const fadeInterval = setInterval(() => {
          const elapsed = uniforms.time.value - fadeStart;

          if (elapsed >= totalDuration) {
            uniforms.dropStrength.value = 0;
            clearInterval(fadeInterval);

            // Remove this click from active list
            activeClicksRef.current = activeClicksRef.current.filter(
              (click) => click.id !== newClick.id
            );
          } else {
            let strength = finalStrength;

            // Enhanced decay curve with stronger initial impact
            if (elapsed < 0.3) {
              // Stronger initial impact
              strength = finalStrength * (1.0 + Math.sin(elapsed * 10.0) * 0.2);
            } else if (elapsed < 1.0) {
              // Fast decay
              strength =
                finalStrength * 0.95 * Math.exp(-(elapsed - 0.3) * 1.2);
            } else if (elapsed < 2.0) {
              // Medium decay
              strength = finalStrength * 0.5 * Math.exp(-(elapsed - 1.0) * 1.0);
            } else if (elapsed < 3.5) {
              // Slow decay
              strength =
                finalStrength * 0.25 * Math.exp(-(elapsed - 2.0) * 0.8);
            } else {
              // Final fade
              strength = finalStrength * 0.1 * Math.exp(-(elapsed - 3.5) * 2.5);
            }

            uniforms.dropStrength.value = Math.max(0, strength);
          }
        }, 24); // ~42fps for smoother animation
      }
    };

    canvas.addEventListener("mousemove", throttledMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleClick);

    return () => {
      canvas.removeEventListener("mousemove", throttledMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleClick);
      if (mouseMoveThrottle) clearTimeout(mouseMoveThrottle);
      if (mouseLeaveTimeoutRef.current)
        clearTimeout(mouseLeaveTimeoutRef.current);
      canvas.style.cursor = "default";
    };
  }, [gl, uniforms, updateMousePosition]);

  useFrame((state) => {
    frameCount.current++;

    if (meshRef.current && particleGroupRef.current) {
      uniforms.time.value = state.clock.elapsedTime;

      // Smooth interpolation of mouse influence for fade in/out
      const influenceDelta =
        targetMouseInfluence.current - mouseInfluenceRef.current;

      if (Math.abs(influenceDelta) > 0.001) {
        // Smooth easing - faster when entering, slower when leaving
        const easeSpeed =
          targetMouseInfluence.current > mouseInfluenceRef.current
            ? mouseEnterSpeed
            : mouseExitSpeed;
        mouseInfluenceRef.current += influenceDelta * easeSpeed;

        // Clamp to avoid overshooting
        if (Math.abs(influenceDelta) < 0.01) {
          mouseInfluenceRef.current = targetMouseInfluence.current;
        }
      }

      // Gradual decay when mouse stops moving over sphere
      if (isMouseOverSphere.current) {
        const timeSinceLastMouse = Date.now() - lastMouseTime.current;
        if (timeSinceLastMouse > 150) {
          // Slowly reduce influence if mouse isn't moving
          targetMouseInfluence.current = Math.max(
            0.3,
            targetMouseInfluence.current * 0.98
          );
        }
      }

      uniforms.mouseInfluence.value = mouseInfluenceRef.current;
      uniforms.mousePosition3D.value.copy(currentMousePos.current);
      uniforms.prevMousePosition3D.value.copy(prevMousePos.current);

      // Slower rotation for better performance
      particleGroupRef.current.rotation.y += 0.0008;
      particleGroupRef.current.rotation.x += 0.0004;
    }
  });

  return (
    <group>
      <group ref={particleGroupRef}>
        <points ref={meshRef}>
          <bufferGeometry>
            <bufferAttribute
              attach='attributes-position'
              args={[positions, 3]}
            />
            <bufferAttribute
              attach='attributes-customColor'
              args={[colors, 3]}
            />
            <bufferAttribute attach='attributes-size' args={[sizes, 1]} />
            <bufferAttribute
              attach='attributes-randomOffset'
              args={[randomOffsets, 1]}
            />
          </bufferGeometry>
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}

interface ParticleSphereProps {
  color?: string;
  particleCount?: number;
  particleSize?: number;
  blurAmount?: number;
  sizeVariation?: number;
  chaosAmount?: number;
  fluidViscosity?: number;
  waveAmplitude?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  mouseInteractionColor?: string;
  pulseStrength?: number;
  pulseFrequency?: number;
  pulseInterval?: number;
  // Mouse interaction controls
  mouseInteractionRadius?: number;
  mouseWaveStrength?: number;
  mouseVortexStrength?: number;
  mouseDragStrength?: number;
  mousePushPullStrength?: number;
  mouseEnterSpeed?: number;
  mouseExitSpeed?: number;
  mouseColorInfluenceRadius?: number;
  // Click interaction controls
  clickStrength?: number;
  clickRandomness?: number;
  maxConcurrentClicks?: number;
}

export default function ParticleSphere({
  color = "#4a90e2",
  particleCount = 6000,
  particleSize = 1.5,
  blurAmount = 0.6,
  sizeVariation = 0.5,
  chaosAmount = 0.25,
  fluidViscosity = 0.4,
  waveAmplitude = 0.3,
  opacity = 0.7,
  className = "",
  style = {},
  mouseInteractionColor = "#ff6b9d",
  pulseStrength = 0.4,
  pulseFrequency = 0.6,
  pulseInterval = 1.9,
  // Mouse interaction controls with more aggressive defaults
  mouseInteractionRadius = 5.5,
  mouseWaveStrength = 1.2,
  mouseVortexStrength = 0.8,
  mouseDragStrength = 0.05,
  mousePushPullStrength = 0.6,
  mouseEnterSpeed = 0.2,
  mouseExitSpeed = 0.06,
  mouseColorInfluenceRadius = 4.5,
  // Click interaction controls
  clickStrength = 1.5,
  clickRandomness = 0.3,
  maxConcurrentClicks = 3,
}: ParticleSphereProps) {
  return (
    <div
      className={`w-full h-screen max-w-full overflow-hidden ${className}`}
      style={style}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance", // Request high-performance GPU
        }}
        // Limit pixel ratio for performance
      >
        <ParticleSystem
          color={color}
          particleCount={particleCount}
          particleSize={particleSize}
          blurAmount={blurAmount}
          sizeVariation={sizeVariation}
          chaosAmount={chaosAmount}
          fluidViscosity={fluidViscosity}
          waveAmplitude={waveAmplitude}
          opacity={opacity}
          mouseInteractionColor={mouseInteractionColor}
          pulseStrength={pulseStrength}
          pulseFrequency={pulseFrequency}
          pulseInterval={pulseInterval}
          mouseInteractionRadius={mouseInteractionRadius}
          mouseWaveStrength={mouseWaveStrength}
          mouseVortexStrength={mouseVortexStrength}
          mouseDragStrength={mouseDragStrength}
          mousePushPullStrength={mousePushPullStrength}
          mouseEnterSpeed={mouseEnterSpeed}
          mouseExitSpeed={mouseExitSpeed}
          mouseColorInfluenceRadius={mouseColorInfluenceRadius}
          clickStrength={clickStrength}
          clickRandomness={clickRandomness}
          maxConcurrentClicks={maxConcurrentClicks}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={true}
          maxDistance={12}
          minDistance={6}
        />
      </Canvas>
    </div>
  );
}

{
  // const color = "#000000"; // You can change this to any color you want
  // const particleSize = 0.25; // Size of the particles
  // const blurAmount = 0.3; // Amount of blur for the particles
  // const sizeVariation = 0.9; // Variation in particle size
  // const chaosAmount = 0.2; // Amount of chaos in particle movement
  // const fluidViscosity = 0.4; // Viscosity of the fluid simulation
  // const waveAmplitude = 0.5; // Amplitude of the wave effect
  // const opacity = 0.7; // Opacity of the particles
  // const particleCount = 10000; // Number of particles in the sphere
  // Mouse Interaction Controls (NEW!)
  // const mouseInteractionRadius = 5.5; // Radius of mouse influence (larger = wider effect)
  // const mouseWaveStrength = 1.2; // Strength of wave displacement (higher = more aggressive)
  // const mouseVortexStrength = 0.8; // Strength of spiral/vortex effect (higher = more spin)
  // const mouseDragStrength = 0.05; // Strength of drag following mouse movement (higher = more follow)
  // const mousePushPullStrength = 0.6; // Strength of push/pull pulsing (higher = more push)
  // const mouseEnterSpeed = 0.2; // Speed of fade-in when mouse enters (0.0-1.0, higher = faster)
  // const mouseExitSpeed = 0.06; // Speed of fade-out when mouse exits (0.0-1.0, lower = slower)
  // const mouseColorInfluenceRadius = 4.5; // Radius of color change effect (larger = wider color spread)
  /* <ParticleSphere
  color={color}
  particleCount={particleCount}
  particleSize={particleSize}
  blurAmount={blurAmount}
  sizeVariation={sizeVariation}
  chaosAmount={chaosAmount}
  fluidViscosity={fluidViscosity}
  waveAmplitude={waveAmplitude}
  opacity={opacity}
  mouseInteractionRadius={mouseInteractionRadius}
  mouseWaveStrength={mouseWaveStrength}
  mouseVortexStrength={mouseVortexStrength}
  mouseDragStrength={mouseDragStrength}
  mousePushPullStrength={mousePushPullStrength}
  mouseEnterSpeed={mouseEnterSpeed}
  mouseExitSpeed={mouseExitSpeed}
  mouseColorInfluenceRadius={mouseColorInfluenceRadius}
/>; */
}
