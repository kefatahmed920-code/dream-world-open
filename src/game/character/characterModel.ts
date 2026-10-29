/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface CharacterAppearance {
  gender?: 'male' | 'female';
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'styled' | 'wavy' | 'buzz' | 'ponytail' | 'braid' | 'bob';
  shirtColor: string;
  jacketColor?: string;
  pantsColor: string;
  shoesColor: string;
  hasJacket?: boolean;
  hasGamcha?: boolean;
  hasGlasses?: boolean;
  hasDupatta?: boolean;
}

export const CHARACTER_PRESETS: Record<string, { name: string; title: string; appearance: CharacterAppearance }> = {
  tanvir: {
    name: 'Tanvir',
    title: 'Dhaka Urban Nomad',
    appearance: {
      gender: 'male',
      skinTone: '#c68a62',
      hairColor: '#1a1614',
      hairStyle: 'styled',
      shirtColor: '#2b5c8f',
      jacketColor: '#1d3e64',
      pantsColor: '#222831',
      shoesColor: '#eeeeee',
      hasJacket: true,
      hasGlasses: false,
    },
  },
  rifat: {
    name: 'Rifat',
    title: 'Street Cruiser',
    appearance: {
      gender: 'male',
      skinTone: '#b57b53',
      hairColor: '#111111',
      hairStyle: 'short',
      shirtColor: '#e11d48',
      jacketColor: '#18181b',
      pantsColor: '#1e293b',
      shoesColor: '#f59e0b',
      hasJacket: true,
      hasGlasses: true,
    },
  },
  farhan: {
    name: 'Farhan',
    title: 'Old Dhaka Folk',
    appearance: {
      gender: 'male',
      skinTone: '#d49b73',
      hairColor: '#262626',
      hairStyle: 'wavy',
      shirtColor: '#15803d',
      jacketColor: '#14532d',
      pantsColor: '#f8fafc',
      shoesColor: '#78350f',
      hasJacket: false,
      hasGamcha: true,
      hasGlasses: false,
    },
  },
  nafis: {
    name: 'Nafis',
    title: 'Dhanmondi Tech Explorer',
    appearance: {
      gender: 'male',
      skinTone: '#bd8058',
      hairColor: '#1c1917',
      hairStyle: 'buzz',
      shirtColor: '#0284c7',
      jacketColor: '#334155',
      pantsColor: '#475569',
      shoesColor: '#0284c7',
      hasJacket: true,
      hasGlasses: true,
    },
  },
  ananya: {
    name: 'Ananya',
    title: 'University Scholar',
    appearance: {
      gender: 'female',
      skinTone: '#d99c73',
      hairColor: '#1a1614',
      hairStyle: 'ponytail',
      shirtColor: '#0d9488',
      jacketColor: '#115e59',
      pantsColor: '#1e293b',
      shoesColor: '#f1f5f9',
      hasJacket: true,
      hasGlasses: true,
    },
  },
  nusrat: {
    name: 'Nusrat',
    title: 'Elegance & Heritage',
    appearance: {
      gender: 'female',
      skinTone: '#c88c64',
      hairColor: '#171717',
      hairStyle: 'braid',
      shirtColor: '#be123c',
      jacketColor: '#881337',
      pantsColor: '#881337',
      shoesColor: '#d97706',
      hasJacket: false,
      hasDupatta: true,
      hasGlasses: false,
    },
  },
  meghla: {
    name: 'Meghla',
    title: 'Adventure Cyclist',
    appearance: {
      gender: 'female',
      skinTone: '#b97a52',
      hairColor: '#262626',
      hairStyle: 'bob',
      shirtColor: '#f59e0b',
      jacketColor: '#b45309',
      pantsColor: '#334155',
      shoesColor: '#10b981',
      hasJacket: true,
      hasGlasses: false,
    },
  },
  priya: {
    name: 'Priya',
    title: 'Bengal Arts Enthusiast',
    appearance: {
      gender: 'female',
      skinTone: '#e0a982',
      hairColor: '#1c1917',
      hairStyle: 'wavy',
      shirtColor: '#4338ca',
      jacketColor: '#312e81',
      pantsColor: '#475569',
      shoesColor: '#ffffff',
      hasJacket: false,
      hasDupatta: true,
      hasGlasses: true,
    },
  },
};

export const DEFAULT_PLAYER_APPEARANCE: CharacterAppearance = CHARACTER_PRESETS.tanvir.appearance;

/**
 * Procedural PBR Textures for human character
 */
function createFabricTexture(colorHex: string, pattern: 'denim' | 'cotton' | 'leather'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 256, 256);

  if (pattern === 'denim') {
    // Diagonal twill weave
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let x = -256; x < 512; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 256, 256);
      ctx.stroke();
    }
    // Subtle wash highlights
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(255,255,255,0.05)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
    grad.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  } else if (pattern === 'cotton') {
    // Subtle cross threads
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let y = 0; y < 256; y += 4) {
      ctx.fillRect(0, y, 256, 1);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFaceTexture(skinHex: string, eyeColor = '#3a2012'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = skinHex;
  ctx.fillRect(0, 0, 256, 256);

  // Soft facial contours / cheek blush & jaw shading
  const cheekGrad = ctx.createRadialGradient(128, 140, 30, 128, 140, 120);
  cheekGrad.addColorStop(0, 'rgba(180, 50, 40, 0.08)');
  cheekGrad.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = cheekGrad;
  ctx.fillRect(0, 0, 256, 256);

  // Eyes (left & right)
  const drawEye = (x: number, y: number) => {
    // Sclera
    ctx.fillStyle = '#f0ede6';
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(x, y, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.arc(x, y, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight highlight
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(x - 2.5, y - 2.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Upper eyelid crease
    ctx.strokeStyle = 'rgba(40, 20, 15, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x, y - 2, 17, 10, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();

    // Eyebrow
    ctx.strokeStyle = '#1a1412';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 18, y - 16);
    ctx.quadraticCurveTo(x, y - 20, x + 18, y - 14);
    ctx.stroke();
  };

  drawEye(85, 110);
  drawEye(171, 110);

  // Nose bridge & nostrils
  ctx.strokeStyle = 'rgba(50, 25, 20, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(124, 115);
  ctx.lineTo(123, 145);
  ctx.lineTo(128, 150);
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = 'rgba(40, 15, 10, 0.45)';
  ctx.beginPath();
  ctx.arc(120, 151, 2.5, 0, Math.PI * 2);
  ctx.arc(136, 151, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Realistic lips
  const lipGrad = ctx.createLinearGradient(128, 170, 128, 185);
  lipGrad.addColorStop(0, 'rgba(150, 60, 55, 0.65)');
  lipGrad.addColorStop(1, 'rgba(120, 45, 40, 0.7)');
  ctx.fillStyle = lipGrad;
  ctx.beginPath();
  ctx.ellipse(128, 175, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center lip line
  ctx.strokeStyle = 'rgba(60, 20, 20, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(108, 175);
  ctx.quadraticCurveTo(128, 177, 148, 175);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Hierarchical Skeletal Human Rig
 * Realistic adult human anatomy (1.78m height, 1:7.5 head-to-body ratio).
 */
export class CharacterRig {
  public group: THREE.Group;
  public appearance: CharacterAppearance;

  // Joint transforms
  public root: THREE.Group;
  public pelvis: THREE.Group;
  public spineLower: THREE.Group;
  public spineUpper: THREE.Group;
  public neck: THREE.Group;
  public head: THREE.Group;

  public leftShoulder: THREE.Group;
  public leftUpperArm: THREE.Group;
  public leftForearm: THREE.Group;
  public leftHand: THREE.Group;

  public rightShoulder: THREE.Group;
  public rightUpperArm: THREE.Group;
  public rightForearm: THREE.Group;
  public rightHand: THREE.Group;

  public leftHip: THREE.Group;
  public leftThigh: THREE.Group;
  public leftCalf: THREE.Group;
  public leftFoot: THREE.Group;

  public rightHip: THREE.Group;
  public rightThigh: THREE.Group;
  public rightCalf: THREE.Group;
  public rightFoot: THREE.Group;

  // Contact shadow
  public contactShadow: THREE.Mesh;

  // Animation state
  private animPhase = 0;
  private currentMoveSpeed = 0;
  private isAirborne = false;
  private jumpTime = 0;
  private isSeatedInVehicle = false;

  constructor(appearance: CharacterAppearance = DEFAULT_PLAYER_APPEARANCE) {
    this.appearance = appearance;
    this.group = new THREE.Group();
    this.group.name = 'Character';

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.skinTone),
      roughness: 0.65,
      metalness: 0.05,
    });

    const faceTex = createFaceTexture(appearance.skinTone);
    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.6,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.hairColor),
      roughness: 0.85,
      metalness: 0.1,
    });

    const shirtTex = createFabricTexture(appearance.shirtColor, 'cotton');
    const shirtMat = new THREE.MeshStandardMaterial({
      map: shirtTex,
      roughness: 0.8,
      metalness: 0.05,
    });

    const jacketColor = appearance.jacketColor || appearance.shirtColor;
    const jacketTex = createFabricTexture(jacketColor, 'denim');
    const jacketMat = new THREE.MeshStandardMaterial({
      map: jacketTex,
      roughness: 0.75,
      metalness: 0.1,
    });

    const pantsTex = createFabricTexture(appearance.pantsColor, 'denim');
    const pantsMat = new THREE.MeshStandardMaterial({
      map: pantsTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(appearance.shoesColor),
      roughness: 0.45,
      metalness: 0.1,
    });

    const shoeSoleMat = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
    });

    // Root node
    this.root = new THREE.Group();
    this.group.add(this.root);

    // Contact Ground Shadow
    const shadowGeo = new THREE.PlaneGeometry(0.75, 0.75);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    this.contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadow.rotation.x = -Math.PI / 2;
    this.contactShadow.position.y = 0.02;
    this.group.add(this.contactShadow);

    const isFemale = appearance.gender === 'female';

    // --- SKELETON SETUP (Realistic human anatomy with gendered proportions) ---
    // Pelvis center at y = 0.98m
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.98;
    this.root.add(this.pelvis);

    // Pelvis Mesh (Female has slightly wider hips for realistic pelvic anatomy)
    const pelvisWidth = isFemale ? 0.31 : 0.28;
    const pelvisGeo = new THREE.BoxGeometry(pelvisWidth, 0.16, 0.22);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    this.pelvis.add(pelvisMesh);

    // Lower Spine & Waist (Female has narrower, defined waist)
    this.spineLower = new THREE.Group();
    this.spineLower.position.y = 0.1;
    this.pelvis.add(this.spineLower);

    const waistWidth = isFemale ? 0.25 : 0.29;
    const abdomenGeo = new THREE.BoxGeometry(waistWidth, 0.18, isFemale ? 0.19 : 0.21);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, shirtMat);
    abdomenMesh.position.y = 0.09;
    abdomenMesh.castShadow = true;
    this.spineLower.add(abdomenMesh);

    // Upper Spine / Chest (Female: subtle contoured bust & slimmer ribcage; Male: broader athletic chest)
    this.spineUpper = new THREE.Group();
    this.spineUpper.position.y = 0.18;
    this.spineLower.add(this.spineUpper);

    const chestMat = appearance.hasJacket ? jacketMat : shirtMat;
    const chestWidth = isFemale ? 0.30 : 0.35;
    const chestGeo = new THREE.BoxGeometry(chestWidth, 0.26, isFemale ? 0.21 : 0.24);
    const chestMesh = new THREE.Mesh(chestGeo, chestMat);
    chestMesh.position.y = 0.13;
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    this.spineUpper.add(chestMesh);

    // Female anatomical chest contour
    if (isFemale) {
      const bustGeo = new THREE.BoxGeometry(0.24, 0.11, 0.08);
      const bustMesh = new THREE.Mesh(bustGeo, chestMat);
      bustMesh.position.set(0, 0.12, 0.12);
      bustMesh.castShadow = true;
      this.spineUpper.add(bustMesh);
    }

    // Traditional Dupatta / Scarf drape (South Asian fashion)
    if (appearance.hasDupatta) {
      const dupattaMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(appearance.jacketColor || '#f59e0b'),
        roughness: 0.9,
      });
      const drapeGeo = new THREE.BoxGeometry(0.12, 0.45, 0.06);
      const drapeMesh = new THREE.Mesh(drapeGeo, dupattaMat);
      drapeMesh.position.set(0.12, 0.05, 0.09);
      drapeMesh.rotation.z = -0.15;
      drapeMesh.castShadow = true;
      this.spineUpper.add(drapeMesh);
    }

    // Jacket collar/zipper accent
    if (appearance.hasJacket) {
      const collarWidth = isFemale ? 0.21 : 0.24;
      const collarGeo = new THREE.BoxGeometry(collarWidth, 0.06, 0.23);
      const collarMesh = new THREE.Mesh(collarGeo, jacketMat);
      collarMesh.position.y = 0.26;
      this.spineUpper.add(collarMesh);
    }

    // Neck
    this.neck = new THREE.Group();
    this.neck.position.y = 0.27;
    this.spineUpper.add(this.neck);

    const neckRadius = isFemale ? 0.055 : 0.065;
    const neckGeo = new THREE.CylinderGeometry(neckRadius, neckRadius + 0.01, 0.09, 12);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = 0.045;
    neckMesh.castShadow = true;
    this.neck.add(neckMesh);

    // Head
    this.head = new THREE.Group();
    this.head.position.y = 0.09;
    this.neck.add(this.head);

    // Cranium
    const headGeo = new THREE.BoxGeometry(0.19, 0.23, 0.21);
    const headMaterials = [
      skinMat, // +x right
      skinMat, // -x left
      hairMat, // +y top
      skinMat, // -y bottom
      faceMat, // +z front face
      hairMat, // -z back hair
    ];
    const headMesh = new THREE.Mesh(headGeo, headMaterials);
    headMesh.position.y = 0.12;
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Dynamic Hair Styles
    const style = appearance.hairStyle || 'styled';
    if (style === 'styled' || style === 'short' || style === 'buzz') {
      const hairGeo = new THREE.BoxGeometry(0.21, style === 'buzz' ? 0.06 : 0.12, 0.23);
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.position.set(0, 0.22, -0.01);
      this.head.add(hairMesh);

      if (style !== 'buzz') {
        const hairFringeGeo = new THREE.BoxGeometry(0.19, 0.05, 0.06);
        const hairFringe = new THREE.Mesh(hairFringeGeo, hairMat);
        hairFringe.position.set(0, 0.2, 0.1);
        hairFringe.rotation.x = 0.2;
        this.head.add(hairFringe);
      }
    } else if (style === 'wavy') {
      const hairGeo = new THREE.BoxGeometry(0.22, 0.22, 0.24);
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.position.set(0, 0.17, -0.02);
      this.head.add(hairMesh);
    } else if (style === 'ponytail') {
      // Main crown volume
      const crownGeo = new THREE.BoxGeometry(0.21, 0.14, 0.23);
      const crownMesh = new THREE.Mesh(crownGeo, hairMat);
      crownMesh.position.set(0, 0.21, -0.02);
      this.head.add(crownMesh);

      // High ponytail bunch
      const ponytailGeo = new THREE.CylinderGeometry(0.04, 0.025, 0.35, 8);
      const ponytailMesh = new THREE.Mesh(ponytailGeo, hairMat);
      ponytailMesh.position.set(0, 0.14, -0.16);
      ponytailMesh.rotation.x = -0.3;
      ponytailMesh.castShadow = true;
      this.head.add(ponytailMesh);
    } else if (style === 'braid') {
      // Crown volume
      const crownGeo = new THREE.BoxGeometry(0.21, 0.15, 0.23);
      const crownMesh = new THREE.Mesh(crownGeo, hairMat);
      crownMesh.position.set(0, 0.21, -0.02);
      this.head.add(crownMesh);

      // Long traditional braid down the back
      const braidGeo = new THREE.CylinderGeometry(0.045, 0.025, 0.48, 8);
      const braidMesh = new THREE.Mesh(braidGeo, hairMat);
      braidMesh.position.set(0, 0.04, -0.14);
      braidMesh.rotation.x = -0.12;
      braidMesh.castShadow = true;
      this.head.add(braidMesh);
    } else if (style === 'bob') {
      // Curved bob cut
      const bobGeo = new THREE.BoxGeometry(0.23, 0.26, 0.24);
      const bobMesh = new THREE.Mesh(bobGeo, hairMat);
      bobMesh.position.set(0, 0.16, -0.01);
      this.head.add(bobMesh);
    }

    // Glasses / Spectacles
    if (appearance.hasGlasses) {
      const glassesMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.8,
        roughness: 0.2,
      });
      const frameGeo = new THREE.BoxGeometry(0.18, 0.04, 0.02);
      const frame = new THREE.Mesh(frameGeo, glassesMat);
      frame.position.set(0, 0.14, 0.115);
      this.head.add(frame);
    }

    // Bengali Gamcha (traditional neck wrap / scarf) if requested
    if (appearance.hasGamcha) {
      const gamchaGeo = new THREE.TorusGeometry(0.12, 0.04, 8, 16);
      const gamchaMat = new THREE.MeshStandardMaterial({
        color: 0xd92525, // Red checkered gamcha
        roughness: 0.9,
      });
      const gamcha = new THREE.Mesh(gamchaGeo, gamchaMat);
      gamcha.rotation.x = Math.PI / 2;
      gamcha.position.y = 0.02;
      this.neck.add(gamcha);
    }

    // --- ARMS (Left & Right) with gendered shoulder width ---
    const shoulderOffset = isFemale ? 0.17 : 0.20;
    const armRadius = isFemale ? 0.046 : 0.055;
    const forearmRadius = isFemale ? 0.040 : 0.048;

    // Left Shoulder
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(shoulderOffset, 0.22, 0);
    this.spineUpper.add(this.leftShoulder);

    this.leftUpperArm = new THREE.Group();
    this.leftShoulder.add(this.leftUpperArm);
    const upperArmGeo = new THREE.CylinderGeometry(armRadius, armRadius - 0.005, 0.27, 10);
    const upperArmMesh = new THREE.Mesh(upperArmGeo, chestMat);
    upperArmMesh.position.y = -0.135;
    upperArmMesh.castShadow = true;
    this.leftUpperArm.add(upperArmMesh);

    // Left Forearm
    this.leftForearm = new THREE.Group();
    this.leftForearm.position.y = -0.27;
    this.leftUpperArm.add(this.leftForearm);
    const forearmGeo = new THREE.CylinderGeometry(forearmRadius, forearmRadius - 0.006, 0.26, 10);
    const forearmMesh = new THREE.Mesh(forearmGeo, skinMat);
    forearmMesh.position.y = -0.13;
    forearmMesh.castShadow = true;
    this.leftForearm.add(forearmMesh);

    // Left Hand
    this.leftHand = new THREE.Group();
    this.leftHand.position.y = -0.26;
    this.leftForearm.add(this.leftHand);
    const handGeo = new THREE.BoxGeometry(0.065, 0.1, 0.045);
    const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
    leftHandMesh.position.y = -0.05;
    this.leftHand.add(leftHandMesh);

    // Right Shoulder
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(-shoulderOffset, 0.22, 0);
    this.spineUpper.add(this.rightShoulder);

    this.rightUpperArm = new THREE.Group();
    this.rightShoulder.add(this.rightUpperArm);
    const rightUpperArmMesh = new THREE.Mesh(upperArmGeo, chestMat);
    rightUpperArmMesh.position.y = -0.135;
    rightUpperArmMesh.castShadow = true;
    this.rightUpperArm.add(rightUpperArmMesh);

    // Right Forearm
    this.rightForearm = new THREE.Group();
    this.rightForearm.position.y = -0.27;
    this.rightUpperArm.add(this.rightForearm);
    const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMat);
    rightForearmMesh.position.y = -0.13;
    rightForearmMesh.castShadow = true;
    this.rightForearm.add(rightForearmMesh);

    // Right Hand
    this.rightHand = new THREE.Group();
    this.rightHand.position.y = -0.26;
    this.rightForearm.add(this.rightHand);
    const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
    rightHandMesh.position.y = -0.05;
    this.rightHand.add(rightHandMesh);

    // --- LEGS (Left & Right) ---
    // Left Hip / Thigh
    this.leftHip = new THREE.Group();
    this.leftHip.position.set(0.1, -0.08, 0);
    this.pelvis.add(this.leftHip);

    this.leftThigh = new THREE.Group();
    this.leftHip.add(this.leftThigh);
    const thighGeo = new THREE.CylinderGeometry(0.08, 0.065, 0.44, 12);
    const leftThighMesh = new THREE.Mesh(thighGeo, pantsMat);
    leftThighMesh.position.y = -0.22;
    leftThighMesh.castShadow = true;
    this.leftThigh.add(leftThighMesh);

    // Left Knee / Calf
    this.leftCalf = new THREE.Group();
    this.leftCalf.position.y = -0.44;
    this.leftThigh.add(this.leftCalf);
    const calfGeo = new THREE.CylinderGeometry(0.062, 0.05, 0.43, 12);
    const leftCalfMesh = new THREE.Mesh(calfGeo, pantsMat);
    leftCalfMesh.position.y = -0.215;
    leftCalfMesh.castShadow = true;
    this.leftCalf.add(leftCalfMesh);

    // Left Foot / Shoe
    this.leftFoot = new THREE.Group();
    this.leftFoot.position.y = -0.43;
    this.leftCalf.add(this.leftFoot);

    const shoeGeo = new THREE.BoxGeometry(0.1, 0.08, 0.22);
    const leftShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoeMesh.position.set(0, -0.04, 0.05);
    leftShoeMesh.castShadow = true;
    this.leftFoot.add(leftShoeMesh);

    const shoeSoleGeo = new THREE.BoxGeometry(0.106, 0.025, 0.226);
    const leftSoleMesh = new THREE.Mesh(shoeSoleGeo, shoeSoleMat);
    leftSoleMesh.position.set(0, -0.08, 0.05);
    this.leftFoot.add(leftSoleMesh);

    // Right Hip / Thigh
    this.rightHip = new THREE.Group();
    this.rightHip.position.set(-0.1, -0.08, 0);
    this.pelvis.add(this.rightHip);

    this.rightThigh = new THREE.Group();
    this.rightHip.add(this.rightThigh);
    const rightThighMesh = new THREE.Mesh(thighGeo, pantsMat);
    rightThighMesh.position.y = -0.22;
    rightThighMesh.castShadow = true;
    this.rightThigh.add(rightThighMesh);

    // Right Knee / Calf
    this.rightCalf = new THREE.Group();
    this.rightCalf.position.y = -0.44;
    this.rightThigh.add(this.rightCalf);
    const rightCalfMesh = new THREE.Mesh(calfGeo, pantsMat);
    rightCalfMesh.position.y = -0.215;
    rightCalfMesh.castShadow = true;
    this.rightCalf.add(rightCalfMesh);

    // Right Foot / Shoe
    this.rightFoot = new THREE.Group();
    this.rightFoot.position.y = -0.43;
    this.rightCalf.add(this.rightFoot);

    const rightShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoeMesh.position.set(0, -0.04, 0.05);
    rightShoeMesh.castShadow = true;
    this.rightFoot.add(rightShoeMesh);

    const rightSoleMesh = new THREE.Mesh(shoeSoleGeo, shoeSoleMat);
    rightSoleMesh.position.set(0, -0.08, 0.05);
    this.rightFoot.add(rightSoleMesh);
  }

  /**
   * High-quality procedural animation blending and IK gait
   */
  public updateAnimation(
    delta: number,
    speed: number, // 0 to 1 (0 = idle, 0.4 = walk, 0.8 = run, 1.0 = sprint)
    isAirborne: boolean,
    isSeated = false,
    stance: 'stand' | 'crouch' | 'prone' | 'swim' = 'stand',
  ) {
    this.isAirborne = isAirborne;
    this.isSeatedInVehicle = isSeated;

    // Smooth speed transition
    this.currentMoveSpeed = THREE.MathUtils.damp(this.currentMoveSpeed, speed, 10, delta);

    // Vehicle Seated Pose
    if (this.isSeatedInVehicle) {
      this.pelvis.position.y = THREE.MathUtils.damp(this.pelvis.position.y, 0.55, 8, delta);
      this.pelvis.rotation.x = THREE.MathUtils.damp(this.pelvis.rotation.x, 0, 8, delta);
      this.spineLower.rotation.x = THREE.MathUtils.damp(this.spineLower.rotation.x, 0.1, 8, delta);
      this.spineUpper.rotation.x = THREE.MathUtils.damp(this.spineUpper.rotation.x, 0.15, 8, delta);

      // Thighs bent 85 degrees sitting forward
      this.leftThigh.rotation.x = THREE.MathUtils.damp(this.leftThigh.rotation.x, -1.45, 8, delta);
      this.rightThigh.rotation.x = THREE.MathUtils.damp(this.rightThigh.rotation.x, -1.45, 8, delta);

      // Calves bent 90 degrees down
      this.leftCalf.rotation.x = THREE.MathUtils.damp(this.leftCalf.rotation.x, 1.5, 8, delta);
      this.rightCalf.rotation.x = THREE.MathUtils.damp(this.rightCalf.rotation.x, 1.5, 8, delta);

      // Arms reaching forward to steering wheel / handlebar
      this.leftUpperArm.rotation.x = THREE.MathUtils.damp(this.leftUpperArm.rotation.x, -0.85, 8, delta);
      this.rightUpperArm.rotation.x = THREE.MathUtils.damp(this.rightUpperArm.rotation.x, -0.85, 8, delta);
      this.leftUpperArm.rotation.z = THREE.MathUtils.damp(this.leftUpperArm.rotation.z, 0.25, 8, delta);
      this.rightUpperArm.rotation.z = THREE.MathUtils.damp(this.rightUpperArm.rotation.z, -0.25, 8, delta);
      this.leftForearm.rotation.x = THREE.MathUtils.damp(this.leftForearm.rotation.x, -0.3, 8, delta);
      this.rightForearm.rotation.x = THREE.MathUtils.damp(this.rightForearm.rotation.x, -0.3, 8, delta);

      this.contactShadow.visible = false;
      return;
    }

    // 1. SWIMMING STANCE (Belly-down horizontal in water)
    if (stance === 'swim') {
      this.contactShadow.visible = false;
      this.pelvis.position.x = 0;
      this.pelvis.position.y = THREE.MathUtils.damp(this.pelvis.position.y, 0.45, 8, delta);

      this.animPhase += delta * (3.5 + this.currentMoveSpeed * 6.0);
      const phase = this.animPhase;

      if (this.currentMoveSpeed < 0.05) {
        // Treading water idle: partially upright body, gentle sculling
        const tread = Math.sin(phase * 1.5);
        this.pelvis.rotation.x = THREE.MathUtils.damp(this.pelvis.rotation.x, 0.55, 6, delta);
        this.head.rotation.x = THREE.MathUtils.damp(this.head.rotation.x, -0.35, 6, delta);
        this.pelvis.position.y = 0.45 + tread * 0.03;
        this.leftUpperArm.rotation.set(-0.25 + tread * 0.2, 0, 0.55 + tread * 0.15);
        this.rightUpperArm.rotation.set(-0.25 + tread * 0.2, 0, -0.55 - tread * 0.15);
        this.leftForearm.rotation.set(-0.35, 0, 0);
        this.rightForearm.rotation.set(-0.35, 0, 0);
        this.leftThigh.rotation.set(-0.2 + tread * 0.25, 0, 0.1);
        this.rightThigh.rotation.set(-0.2 - tread * 0.25, 0, -0.1);
        this.leftCalf.rotation.set(0.5, 0, 0);
        this.rightCalf.rotation.set(0.5, 0, 0);
      } else {
        // Active Swimming Crawl / Freestyle: fully horizontal, belly-down
        this.pelvis.rotation.x = THREE.MathUtils.damp(this.pelvis.rotation.x, 1.40, 8, delta);
        this.head.rotation.x = THREE.MathUtils.damp(this.head.rotation.x, -1.15, 8, delta);
        this.spineLower.rotation.x = 0.08;

        // Alternating arm strokes reaching forward
        const stroke = phase * 2.4;
        this.leftUpperArm.rotation.x = 0.65 + Math.sin(stroke) * 1.1;
        this.rightUpperArm.rotation.x = 0.65 + Math.sin(stroke + Math.PI) * 1.1;
        this.leftUpperArm.rotation.z = 0.35 + Math.cos(stroke) * 0.35;
        this.rightUpperArm.rotation.z = -0.35 - Math.cos(stroke + Math.PI) * 0.35;
        this.leftForearm.rotation.x = 0.6 + Math.sin(stroke) * 0.3;
        this.rightForearm.rotation.x = 0.6 + Math.sin(stroke + Math.PI) * 0.3;

        // Rapid flutter kicks extending behind
        const kickL = Math.sin(phase * 4.2);
        this.leftThigh.rotation.x = -kickL * 0.35;
        this.rightThigh.rotation.x = kickL * 0.35;
        this.leftCalf.rotation.x = Math.max(0, kickL) * 0.45;
        this.rightCalf.rotation.x = Math.max(0, -kickL) * 0.45;
      }
      return;
    }

    // 2. PRONE STANCE (Natural forward-facing, belly-down crawling)
    if (stance === 'prone') {
      this.contactShadow.visible = true;
      // Pelvis at 0.14m above ground, belly facing down (+1.48 rad on X)
      this.pelvis.position.y = THREE.MathUtils.damp(this.pelvis.position.y, 0.14, 10, delta);
      this.pelvis.rotation.x = THREE.MathUtils.damp(this.pelvis.rotation.x, 1.48, 8, delta);
      // Head raised forward looking in movement direction (-1.25 rad on X aligns head with ground horizontal)
      this.head.rotation.x = THREE.MathUtils.damp(this.head.rotation.x, -1.25, 8, delta);
      this.spineLower.rotation.x = 0.04;
      this.spineUpper.rotation.x = 0.04;

      this.animPhase += delta * (2.8 + this.currentMoveSpeed * 5.5);
      const phase = this.animPhase;

      if (this.currentMoveSpeed < 0.05) {
        // Idle prone: belly-down, elbows on ground supporting chest, legs straight back
        this.pelvis.position.x = 0;
        this.leftUpperArm.rotation.set(0.75, 0.2, 0.35);
        this.rightUpperArm.rotation.set(0.75, -0.2, -0.35);
        this.leftForearm.rotation.set(0.85, 0, 0);
        this.rightForearm.rotation.set(0.85, 0, 0);
        this.leftThigh.rotation.set(-0.05, 0, 0.1);
        this.rightThigh.rotation.set(-0.05, 0, -0.1);
        this.leftCalf.rotation.set(0.2, 0, 0);
        this.rightCalf.rotation.set(0.2, 0, 0);
        this.leftFoot.rotation.set(-0.3, 0, 0);
        this.rightFoot.rotation.set(-0.3, 0, 0);
      } else {
        // Commando army crawl: alternating elbow pull and knee push
        const crawlCycle = Math.sin(phase * 2.2);
        // Subtle natural pelvis serpentine sway
        this.pelvis.position.x = Math.sin(phase * 2.2) * 0.03;

        // Arms reach and drag forward
        this.leftUpperArm.rotation.x = 0.75 + crawlCycle * 0.55;
        this.rightUpperArm.rotation.x = 0.75 - crawlCycle * 0.55;
        this.leftUpperArm.rotation.z = 0.35 + crawlCycle * 0.15;
        this.rightUpperArm.rotation.z = -0.35 + crawlCycle * 0.15;
        this.leftForearm.rotation.x = 0.85 + Math.max(0, crawlCycle) * 0.25;
        this.rightForearm.rotation.x = 0.85 + Math.max(0, -crawlCycle) * 0.25;

        // Legs: knee drives forward on the ground when pulling
        this.leftThigh.rotation.x = Math.max(0, -crawlCycle) * 0.65;
        this.rightThigh.rotation.x = Math.max(0, crawlCycle) * 0.65;
        this.leftThigh.rotation.z = 0.15 + Math.max(0, -crawlCycle) * 0.25;
        this.rightThigh.rotation.z = -0.15 - Math.max(0, crawlCycle) * 0.25;
        this.leftCalf.rotation.x = 0.2 + Math.max(0, -crawlCycle) * 0.75;
        this.rightCalf.rotation.x = 0.2 + Math.max(0, crawlCycle) * 0.75;
        this.leftFoot.rotation.x = -0.3;
        this.rightFoot.rotation.x = -0.3;
      }
      return;
    }

    // 3. CROUCH STANCE (Low Tactical Walk)
    if (stance === 'crouch') {
      this.contactShadow.visible = true;
      this.pelvis.position.y = THREE.MathUtils.damp(this.pelvis.position.y, 0.60, 10, delta);
      this.pelvis.rotation.x = THREE.MathUtils.damp(this.pelvis.rotation.x, 0, 8, delta);
      this.head.rotation.x = THREE.MathUtils.damp(this.head.rotation.x, -0.15, 8, delta);
      this.spineLower.rotation.x = 0.38;
      this.spineUpper.rotation.x = 0.22;

      this.animPhase += delta * (4.5 + this.currentMoveSpeed * 6.5);
      const phase = this.animPhase;

      if (this.currentMoveSpeed < 0.05) {
        // Crouch idle
        this.leftThigh.rotation.set(-0.75, 0, 0.05);
        this.rightThigh.rotation.set(-0.75, 0, -0.05);
        this.leftCalf.rotation.set(1.2, 0, 0);
        this.rightCalf.rotation.set(1.2, 0, 0);
        this.leftFoot.rotation.set(-0.35, 0, 0);
        this.rightFoot.rotation.set(-0.35, 0, 0);
        this.leftUpperArm.rotation.set(-0.4, 0, 0.15);
        this.rightUpperArm.rotation.set(-0.4, 0, -0.15);
        this.leftForearm.rotation.set(-0.6, 0, 0);
        this.rightForearm.rotation.set(-0.6, 0, 0);
      } else {
        // Crouch walk gait
        const swing = Math.sin(phase) * 0.65;
        this.leftThigh.rotation.x = -0.7 + swing;
        this.rightThigh.rotation.x = -0.7 - swing;
        this.leftCalf.rotation.x = 1.1 + Math.max(0, -swing) * 0.4;
        this.rightCalf.rotation.x = 1.1 + Math.max(0, swing) * 0.4;
        this.leftFoot.rotation.x = -0.3;
        this.rightFoot.rotation.x = -0.3;
        this.leftUpperArm.rotation.x = -0.5 - swing * 0.4;
        this.rightUpperArm.rotation.x = -0.5 + swing * 0.4;
        this.leftForearm.rotation.x = -0.7;
        this.rightForearm.rotation.x = -0.7;
      }
      return;
    }

    // 4. STAND STANCE
    this.contactShadow.visible = true;
    this.pelvis.rotation.x = THREE.MathUtils.damp(this.pelvis.rotation.x, 0, 8, delta);
    this.head.rotation.x = THREE.MathUtils.damp(this.head.rotation.x, 0, 8, delta);

    // Airborne / Jump Pose
    if (this.isAirborne) {
      this.jumpTime += delta;
      this.pelvis.position.y = 0.98;
      // Tuck legs slightly
      this.leftThigh.rotation.x = THREE.MathUtils.damp(this.leftThigh.rotation.x, -0.4, 8, delta);
      this.rightThigh.rotation.x = THREE.MathUtils.damp(this.rightThigh.rotation.x, -0.25, 8, delta);
      this.leftCalf.rotation.x = THREE.MathUtils.damp(this.leftCalf.rotation.x, 0.6, 8, delta);
      this.rightCalf.rotation.x = THREE.MathUtils.damp(this.rightCalf.rotation.x, 0.45, 8, delta);

      // Arms raised for balance
      this.leftUpperArm.rotation.x = THREE.MathUtils.damp(this.leftUpperArm.rotation.x, -0.6, 8, delta);
      this.rightUpperArm.rotation.x = THREE.MathUtils.damp(this.rightUpperArm.rotation.x, -0.6, 8, delta);
      this.leftUpperArm.rotation.z = THREE.MathUtils.damp(this.leftUpperArm.rotation.z, 0.45, 8, delta);
      this.rightUpperArm.rotation.z = THREE.MathUtils.damp(this.rightUpperArm.rotation.z, -0.45, 8, delta);
      return;
    }

    this.jumpTime = 0;

    // Cadence scales with speed
    const cadence = 6.0 + this.currentMoveSpeed * 8.0;
    this.animPhase += delta * cadence * (0.15 + this.currentMoveSpeed * 0.85);

    if (this.currentMoveSpeed < 0.05) {
      // --- IDLE STATE ---
      // Gentle breathing chest expansion
      const breath = Math.sin(this.animPhase * 0.4);
      this.spineUpper.scale.set(1 + breath * 0.02, 1 + breath * 0.015, 1 + breath * 0.03);
      this.spineUpper.rotation.x = THREE.MathUtils.damp(this.spineUpper.rotation.x, breath * 0.02, 4, delta);

      // Subtle hip weight shift
      const sway = Math.sin(this.animPhase * 0.35);
      this.pelvis.position.y = 0.98 + Math.abs(sway) * 0.005;
      this.pelvis.rotation.z = sway * 0.015;
      this.pelvis.rotation.y = sway * 0.02;

      // Relaxed arms at sides
      this.leftUpperArm.rotation.set(0.04, 0, 0.08);
      this.rightUpperArm.rotation.set(0.04, 0, -0.08);
      this.leftForearm.rotation.set(-0.08, 0, 0);
      this.rightForearm.rotation.set(-0.08, 0, 0);

      // Straight legs
      this.leftThigh.rotation.set(0, 0, 0.02);
      this.rightThigh.rotation.set(0, 0, -0.02);
      this.leftCalf.rotation.set(0, 0, 0);
      this.rightCalf.rotation.set(0, 0, 0);
      this.leftFoot.rotation.set(0, 0, 0);
      this.rightFoot.rotation.set(0, 0, 0);
    } else {
      // --- LOCOMOTION STATE (Walk / Run / Sprint) ---
      const phase = this.animPhase;
      const speedFactor = this.currentMoveSpeed;

      // Forward lean increases with speed (running/sprinting)
      const forwardLean = THREE.MathUtils.lerp(0.04, 0.32, speedFactor);
      this.spineLower.rotation.x = forwardLean;
      this.spineUpper.rotation.x = forwardLean * 0.5;

      // Vertical bounce (heel strikes twice per cycle)
      const bounceHeight = THREE.MathUtils.lerp(0.02, 0.06, speedFactor);
      this.pelvis.position.y = 0.98 + Math.abs(Math.sin(phase)) * bounceHeight;

      // Hip twisting around Y
      const hipTwist = Math.sin(phase) * (0.08 + speedFactor * 0.12);
      this.pelvis.rotation.y = hipTwist;

      // --- LEGS STRIDE ---
      const maxLegSwing = THREE.MathUtils.lerp(0.55, 1.15, speedFactor);
      const leftLegAngle = Math.sin(phase) * maxLegSwing;
      const rightLegAngle = -leftLegAngle;

      this.leftThigh.rotation.x = leftLegAngle;
      this.rightThigh.rotation.x = rightLegAngle;

      // Knees bend during backward swing to lift foot
      const leftKneeBend = Math.max(0, -Math.sin(phase + 0.3)) * (0.6 + speedFactor * 0.9);
      const rightKneeBend = Math.max(0, Math.sin(phase + 0.3)) * (0.6 + speedFactor * 0.9);

      this.leftCalf.rotation.x = leftKneeBend;
      this.rightCalf.rotation.x = rightKneeBend;

      // Ankle heel-to-toe roll
      this.leftFoot.rotation.x = -leftLegAngle * 0.4 + leftKneeBend * 0.2;
      this.rightFoot.rotation.x = -rightLegAngle * 0.4 + rightKneeBend * 0.2;

      // --- ARMS COUNTER-SWING ---
      const maxArmSwing = THREE.MathUtils.lerp(0.45, 1.05, speedFactor);
      // Arms swing opposite to legs
      this.leftUpperArm.rotation.x = -leftLegAngle * maxArmSwing;
      this.rightUpperArm.rotation.x = -rightLegAngle * maxArmSwing;

      // Elbows bent slightly
      const elbowBend = THREE.MathUtils.lerp(0.2, 0.85, speedFactor);
      this.leftForearm.rotation.x = -elbowBend;
      this.rightForearm.rotation.x = -elbowBend;
    }
  }

  /**
   * Head look-at targeting for natural NPC/player gaze
   */
  public lookAt(targetWorldPos: THREE.Vector3) {
    const headWorldPos = new THREE.Vector3();
    this.head.getWorldPosition(headWorldPos);

    const dir = targetWorldPos.clone().sub(headWorldPos).normalize();
    const yaw = Math.atan2(dir.x, dir.z) - this.group.rotation.y;
    const pitch = -Math.asin(THREE.MathUtils.clamp(dir.y, -0.6, 0.6));

    // Clamp human neck limits
    const clampedYaw = THREE.MathUtils.clamp(yaw, -Math.PI / 3, Math.PI / 3);
    const clampedPitch = THREE.MathUtils.clamp(pitch, -Math.PI / 4, Math.PI / 4);

    this.head.rotation.y = THREE.MathUtils.damp(this.head.rotation.y, clampedYaw, 6, 0.016);
    this.head.rotation.x = THREE.MathUtils.damp(this.head.rotation.x, clampedPitch, 6, 0.016);
  }
}
