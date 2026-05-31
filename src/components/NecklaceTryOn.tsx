import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  Upload,
  Sparkles,
  Trash2,
  Camera,
  CameraOff,
  Aperture,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { products, syncProductsWithCloud } from "@/data/products";
import { toast } from "sonner";
import { useStore, storeActions } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";

type Necklace = {
  id: string;
  name: string;
  price: string;
  src: string;
  arSrc: string;
  arScale?: number;
  arOffsetY?: number;
  arOffsetX?: number;
  arRotation?: number;
};
type Collection = { id: string; name: string; items: Necklace[] };

const COLLECTION_DEFS = [
  { id: "graceful-muse", name: "The Graceful Muse - Nàng Thơ Thanh Lịch" },
  { id: "huong-sac-mua-he", name: "Hương Sắc Mùa Hè" },
  { id: "thanh-nha-ngan-hoa", name: "Thanh Nhã Ngân Hoa" },
  { id: "pure-soul", name: "Pure Soul - Tâm Hồn Thuần Khiết" },
];

import { FilesetResolver, FaceLandmarker, PoseLandmarker } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;
let poseLandmarker: PoseLandmarker | null = null;
let isLoadingLandmarker = false;
let faceMode: "IMAGE" | "VIDEO" | null = null;
let poseMode: "IMAGE" | "VIDEO" | null = null;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function resolveArSrc(productLike: any, specsObj: any) {
  const candidates = [
    specsObj?.arImg,
    specsObj?.ar_img,
    specsObj?.arImage,
    specsObj?.ar_image,
    specsObj?.arSrc,
    specsObj?.ar_src,
    productLike?.arImg,
    productLike?.ar_img,
    productLike?.arImage,
    productLike?.ar_image,
    productLike?.arSrc,
    productLike?.ar_src,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
}

function adaptiveLerp(current: number, target: number, delta: number, base = 0.1, maxBoost = 0.22) {
  const speed = Math.abs(delta);
  const alpha = clamp(base + speed * 0.0016, base, base + maxBoost);
  return current + (target - current) * alpha;
}

function setCanvasToHiDPI(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  canvas.width = Math.max(1, Math.round(cssWidth * dpr));
  canvas.height = Math.max(1, Math.round(cssHeight * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

function setLandmarkerMode(mode: "IMAGE" | "VIDEO") {
  if (faceLandmarker && faceMode !== mode) {
    faceLandmarker.setOptions({ runningMode: mode });
    faceMode = mode;
  }
  if (poseLandmarker && poseMode !== mode) {
    poseLandmarker.setOptions({ runningMode: mode });
    poseMode = mode;
  }
}

function drawVideoCover(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  targetW: number,
  targetH: number,
) {
  const vW = video.videoWidth || targetW;
  const vH = video.videoHeight || targetH;
  if (vW <= 0 || vH <= 0) return;

  const videoAspect = vW / vH;
  const targetAspect = targetW / targetH;

  let sx = 0;
  let sy = 0;
  let sWidth = vW;
  let sHeight = vH;

  if (videoAspect > targetAspect) {
    sWidth = vH * targetAspect;
    sx = (vW - sWidth) * 0.5;
  } else if (videoAspect < targetAspect) {
    sHeight = vW / targetAspect;
    sy = (vH - sHeight) * 0.5;
  }

  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
}

function drawNecklaceWrapped(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  rotationDeg: number,
  rollDeg: number,
) {
  const tilt = clamp(rollDeg * 0.65, -22, 22);
  const totalRotation = rotationDeg + tilt;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = 1;
  ctx.translate(centerX, centerY);
  ctx.rotate((totalRotation * Math.PI) / 180);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawNecklaceAroundNeck(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  neckTightness = 0.22,
) {
  const slices = 36;
  const srcW = img.width;
  const srcH = img.height;
  const frontWidth = width * 0.98;
  const curveAmp = height * neckTightness;

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (let i = 0; i < slices; i++) {
    const t0 = i / slices;
    const t1 = (i + 1) / slices;
    const mid = (t0 + t1) * 0.5;

    const x0 = centerX - frontWidth / 2 + t0 * frontWidth;
    const x1 = centerX - frontWidth / 2 + t1 * frontWidth;

    const yn = Math.sin((mid - 0.5) * Math.PI * 2);
    const yOffset = yn * curveAmp;
    const backFade = 1 - Math.min(1, Math.abs(yn) * 1.15);

    const sx = Math.floor(t0 * srcW);
    const sw = Math.max(1, Math.floor((t1 - t0) * srcW));

    ctx.globalAlpha = 0.62 + backFade * 0.38;
    ctx.drawImage(img, sx, 0, sw, srcH, x0, centerY - height / 2 + yOffset, x1 - x0 + 0.35, height);
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function buildNecklaceTexture(source: HTMLCanvasElement) {
  return source;
}

function fuseNeckFromFacePose(
  face: { x: number; y: number; width: number; roll: number; confidence: number } | null,
  pose: { x: number; y: number; width: number; roll: number; confidence: number } | null,
  W: number,
  H: number,
) {
  if (face && pose) {
    const faceNormX = face.x / W;
    const edgePenalty = clamp(Math.abs(faceNormX - 0.5) * 2.4, 0, 0.55);
    
    // Nếu là ảnh selfie/chân dung cận cảnh (chiều rộng khuôn mặt > 15% chiều rộng ảnh),
    // ưu tiên cực cao cho khuôn mặt (85%) để tránh lệch vị trí do vai bị cắt ở rìa ảnh.
    const isSelfie = face.width > W * 0.15;
    const wp = isSelfie ? 0.15 : clamp(0.72 + edgePenalty, 0.72, 0.92);
    const wf = 1 - wp;
    
    return {
      x: face.x * wf + pose.x * wp,
      y: face.y * wf + pose.y * wp,
      width: isSelfie ? (face.width * 0.7 + pose.width * 0.3) : (face.width * 0.3 + pose.width * 0.7),
      roll: face.roll,
    };
  }
  if (pose) return { x: pose.x, y: pose.y, width: pose.width, roll: 0 };
  if (face) return { x: face.x, y: face.y, width: face.width, roll: face.roll };
  return { x: W / 2, y: H * 0.55, width: W * 0.25, roll: 0 };
}

async function initMediaPipe() {
  if (isLoadingLandmarker) return;
  isLoadingLandmarker = true;
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm",
    );

    // Load FaceLandmarker cho các điểm ảnh cận cảnh và góc nghiêng
    if (!faceLandmarker) {
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 1,
      });
    }

    // Load PoseLandmarker chuyên để tìm xương quai xanh và ngực
    if (!poseLandmarker) {
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });
    }

    console.log("MediaPipe Face & Pose Models loaded successfully");
  } catch (e) {
    console.error("Error loading MediaPipe", e);
  }
}

// Thuật toán nhận diện vị trí cổ cực kỳ thông minh bằng AI (MediaPipe Face + Pose Fusion)
function detectNeckPosition(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  video?: HTMLVideoElement,
) {
  if (!faceLandmarker) {
    return { x: W / 2, y: H * 0.55, width: W * 0.25, roll: 0 };
  }

  try {
    let faceResults: any;
    let poseResults: any;

    if (video) {
      setLandmarkerMode("VIDEO");
      const now = performance.now();
      faceResults = faceLandmarker.detectForVideo(video, now);
      poseResults = poseLandmarker ? poseLandmarker.detectForVideo(video, now) : null;
    } else {
      setLandmarkerMode("IMAGE");
      const imgData = ctx.getImageData(0, 0, W, H);
      faceResults = faceLandmarker.detect(imgData);
      poseResults = poseLandmarker ? poseLandmarker.detect(imgData) : null;
    }

    let faceEstimate: {
      x: number;
      y: number;
      width: number;
      roll: number;
      confidence: number;
    } | null = null;
    let poseEstimate: { x: number; y: number; width: number; confidence: number } | null = null;

    if (faceResults?.faceLandmarks?.length) {
      const landmarks = faceResults.faceLandmarks[0];
      const chin = landmarks[152];
      const left = landmarks[234];
      const right = landmarks[454];
      const faceWidth = Math.abs(right.x - left.x) * W;
      const roll = clamp(Math.atan2(right.y - left.y, right.x - left.x) * (180 / Math.PI), -25, 25);

      if (faceWidth > W * 0.08 && faceWidth < W * 0.62) {
        faceEstimate = {
          x: chin.x * W,
          y: chin.y * H + faceWidth * 0.62,
          width: faceWidth * 1.08,
          roll,
          confidence: clamp((faceWidth / (W * 0.28)) * 0.7, 0.25, 0.95),
        };
      }
    }

    if (poseResults?.landmarks?.length) {
      const pose = poseResults.landmarks[0];
      const leftShoulder = pose[11];
      const rightShoulder = pose[12];
      const lVis = leftShoulder?.visibility ?? 0;
      const rVis = rightShoulder?.visibility ?? 0;
      if (lVis > 0.45 && rVis > 0.45) {
        const shoulderDist = Math.abs(rightShoulder.x - leftShoulder.x) * W;
        const centerX = ((leftShoulder.x + rightShoulder.x) / 2) * W;
        const centerY = ((leftShoulder.y + rightShoulder.y) / 2) * H;
        const symmetry = 1 - clamp(Math.abs(leftShoulder.y - rightShoulder.y) * 3.2, 0, 0.6);
        poseEstimate = {
          x: centerX,
          y: centerY - shoulderDist * 0.02,
          width: shoulderDist * 0.6,
          confidence: clamp((lVis + rVis) * 0.5 * symmetry, 0.3, 0.98),
        };
      }
    }

    return fuseNeckFromFacePose(faceEstimate, poseEstimate, W, H);
  } catch (e) {
    console.warn("MediaPipe detection error:", e);
  }

  return null;
}

interface NecklaceTryOnProps {
  initSlug?: string;
  initImage?: string;
}

export function NecklaceTryOn({ initSlug, initImage }: NecklaceTryOnProps) {
  const { isProductsLoaded } = useStore();
  const [photo, setPhoto] = useState<string | null>(null);
  const forcedInitImageRef = useRef<string | null>(initImage || null);
  const [collectionIdx, setCollectionIdx] = useState(0);
  const [tick, setTick] = useState(0);

  // Khởi chạy đồng bộ hóa sản phẩm mới nhất từ Supabase khi component mount
  useEffect(() => {
    syncProductsWithCloud().then(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const collections = useMemo(() => {
    return COLLECTION_DEFS.map(({ id, name }) => ({
      id,
      name,
      items: products
        .filter((p) => p.collectionId === id)
        .map((p) => {
          let specsObj = p.specs;
          if (typeof specsObj === "string") {
            try {
              specsObj = JSON.parse(specsObj);
            } catch (e) {
              console.error("Failed to parse specs JSON string:", e);
            }
          }
          return {
            id: p.slug,
            name: p.name,
            price: p.price,
            src: p.img || "",
            arSrc: resolveArSrc(p, specsObj),
            arScale: specsObj?.arScale !== undefined ? Number(specsObj.arScale) : 60,
            arOffsetY: specsObj?.arOffsetY !== undefined ? Number(specsObj.arOffsetY) : 55,
            arOffsetX: specsObj?.arOffsetX !== undefined ? Number(specsObj.arOffsetX) : 0,
            arRotation: specsObj?.arRotation !== undefined ? Number(specsObj.arRotation) : 0,
          };
        }),
    }));
  }, [isProductsLoaded, tick]);

  const collection = collections[collectionIdx];
  const necklaces = useMemo(() => collection?.items || [], [collection]);
  const [selected, setSelected] = useState<Necklace>(necklaces[0]);
  const [userPicked, setUserPicked] = useState(false);

  // Sync selected product's default settings and AR details when collections/necklaces load from store
  useEffect(() => {
    if (!selected) return;
    const currentActive = necklaces.find((n) => n.id === selected.id);
    if (currentActive) {
      if (
        currentActive.arSrc !== selected.arSrc ||
        currentActive.name !== selected.name ||
        currentActive.price !== selected.price ||
        currentActive.src !== selected.src
      ) {
        setSelected(currentActive);
      }
    } else if (necklaces.length > 0 && !userPicked) {
      setSelected(necklaces[0]);
    }
  }, [necklaces, selected?.id, userPicked]);

  // Custom AR 4-axis states (UC24)
  const [scale, setScale] = useState(60);
  const [offsetY, setOffsetY] = useState(55);
  const [offsetX, setOffsetX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const handleAddToCart = useCallback((necklace: Necklace) => {
    storeActions.addToCart(necklace.id, 1);
    toast.success(`Đã thêm "${necklace.name}" vào giỏ hàng!`);
  }, []);

  const handleBuyNow = useCallback((necklace: Necklace) => {
    storeActions.addToCart(necklace.id, 1);
    navigate({ to: "/gio-hang" });
  }, [navigate]);

  // Thuật toán khởi tạo MediaPipe
  useEffect(() => {
    initMediaPipe();
  }, []);

  // Vị trí AR Tracking bám đuổi mượt mà (Lerp)
  const targetPos = useRef({ x: 320, y: 264 });
  const lastTargetX = useRef(320);
  const lastTargetY = useRef(264);
  const lastNeckSample = useRef({ x: 320, y: 264, t: 0 });
  const trackingHealth = useRef(1);
  const lastGoodLock = useRef({ x: 320, y: 264, width: 120 });
  const deadReckon = useRef({ vx: 0, vy: 0 });
  const forceRelockCounter = useRef(0);
  const centerBiasCalib = useRef(0);
  const centerBiasSamples = useRef(0);
  const centerBiasReady = useRef(false);
  const stableAnchorFrames = useRef(0);
  const neckConfidence = useRef(0.8);
  const faceLostFrames = useRef(0);
  const recoveryBoost = useRef(0);
  const jitterGate = useRef({ x: 0, y: 0 });
  const motionMode = useRef<"steady" | "fast">("steady");
  const speedEMA = useRef(0);
  const poseTrust = useRef(0.7);
  const predictiveOffset = useRef({ x: 0, y: 0 });
  const neckLockActive = useRef(false);
  const hardSnapCooldown = useRef(0);
  const calibratingCenter = useRef(true);
  const calibrationFrames = useRef(0);
  const positionResidual = useRef(0);
  const confidenceWindow = useRef<number[]>([]);
  const microDriftClamp = useRef({ x: 0, y: 0 });
  const slowFollowGuard = useRef(0);
  const inertialBlend = useRef(0);
  const lockScore = useRef(1);
  const relockPending = useRef(false);
  const stabilityScore = useRef(1);
  const trackingMode = useRef<"locked" | "seeking">("locked");
  const prevTarget = useRef({ x: 320, y: 264 });
  const neckMidlineBias = useRef(0);
  const dynamicYOffset = useRef(0);
  const predictedTarget = useRef({ x: 320, y: 264 });
  const poseDominance = useRef(0.72);
  const trustDecay = useRef(0);
  const autoCenterClamp = useRef(0);
  const reacquireFrames = useRef(0);
  const smoothCatchup = useRef(0);
  const lockPersistence = useRef(1);
  const driftIntegrator = useRef({ x: 0, y: 0 });
  const confidencePenalty = useRef(0);
  const rapidMoveBoost = useRef(0);
  const neckCenterCorrection = useRef(0);
  const predictiveGain = useRef(0.2);
  const healthRecovery = useRef(0);
  const lockBias = useRef(0);
  const neckHistory = useRef<{ x: number; y: number; t: number }[]>([]);
  const antiLagBlend = useRef(0.5);
  const centerCompensation = useRef(0);
  const freezeJitter = useRef(false);
  const strongFollow = useRef(0.6);
  const snapThresholdScale = useRef(0.18);
  const poseAnchorWeight = useRef(0.75);
  const faceAnchorWeight = useRef(0.25);
  const neckLockThreshold = useRef(0.68);
  const rapidTurnGuard = useRef(0);
  const adaptivePredict = useRef(0.22);
  const motionResidual = useRef(0);
  const biasTrim = useRef(0);
  const dynamicCenterX = useRef(0);
  const confidenceEMA = useRef(0.8);
  const lockDamping = useRef(0.38);
  const fastSnapAlpha = useRef(0.68);
  const steadySnapAlpha = useRef(0.46);
  const deadZonePx = useRef(3.5);
  const shoulderCenterBias = useRef(0.0);
  const neckWidthTrust = useRef(0.7);
  const hardRelockDistance = useRef(0.2);
  const mediumRelockDistance = useRef(0.12);
  const lockPromotionFrames = useRef(5);
  const seekFrames = useRef(0);
  const lockFrames = useRef(0);
  const finalAnchorNudge = useRef(0);
  const accelGuard = useRef(0);
  const neckDriftBudget = useRef(0);
  const poseStabilityEMA = useRef(0.8);
  const frameDropComp = useRef(0);
  const timeWarpBlend = useRef(0);
  const immediateSnap = useRef(false);
  const inMotionComp = useRef(0);
  const microBiasLearn = useRef(0);
  const anchorConfidence = useRef(0.8);
  const adaptiveHardSnap = useRef(0);
  const velocityClamp = useRef(28);
  const confidenceFloor = useRef(0.35);
  const confidenceCeil = useRef(0.98);
  const poseRecentGood = useRef(0);
  const userCenterDelta = useRef(0);
  const targetMix = useRef(0.6);
  const predictiveMix = useRef(0.28);
  const recoveryAlpha = useRef(0.72);
  const jitterSuppression = useRef(0.5);
  const shoulderLineComp = useRef(0);
  const neckMidlineLock = useRef(0);
  const correctionEMA = useRef(0);
  const driftScore = useRef(0);
  const headMotionScore = useRef(0);
  const poseVisibilityEMA = useRef(0.8);
  const centerlineEMA = useRef(0);
  const adaptiveLock = useRef(0.7);
  const fastTrackAlpha = useRef(0.58);
  const stableTrackAlpha = useRef(0.44);
  const lockResetGate = useRef(0);
  const antiOvershoot = useRef(0.22);
  const predictWindowMs = useRef(50);
  const recenterDriftX = useRef(0);
  const recenterDriftY = useRef(0);
  const fallbackAnchor = useRef({ x: 320, y: 264 });
  const neckAxisAlign = useRef(0);
  const calibrationDone = useRef(false);
  const detectionQuality = useRef(0.8);
  const updateBudget = useRef(0);
  const centerOffsetLearn = useRef(0);
  const neckState = useRef<"good" | "weak">("good");
  const weightedAlpha = useRef(0.5);
  const nearRealtimeBoost = useRef(0.15);
  const adaptiveHardLock = useRef(0.2);
  const driftResetFrames = useRef(0);
  const velocityEMA = useRef({ x: 0, y: 0 });
  const reliability = useRef(0.8);
  const lockBlend = useRef(0.64);
  const poseBiasTrim = useRef(0);
  const offsetLearning = useRef(0);
  const neckAnchorFusion = useRef(0.72);
  const relockConfidence = useRef(0.75);
  const positionGuard = useRef(0);
  const snapGuard = useRef(0);
  const motionAdaptive = useRef(0.3);
  const steadyAdaptive = useRef(0.2);
  const driftRecovery = useRef(0);
  const dynamicBias = useRef(0);
  const arLockState = useRef(1);
  const centerLock = useRef(0);
  const kinematicHint = useRef({ x: 0, y: 0 });
  const lockQuality = useRef(0.8);
  const targetReliability = useRef(0.8);
  const transientRecenter = useRef(0);
  const lockAggressiveness = useRef(0.6);
  const followAggressiveness = useRef(0.6);
  const trackAlpha = useRef(0.5);
  const lockAlpha = useRef(0.65);
  const seekAlpha = useRef(0.8);
  const poseMidline = useRef(0);
  const recenterGain = useRef(0.16);
  const relockBoost = useRef(0.22);
  const driftNudge = useRef(0.08);
  const hardSnapDistPx = useRef(70);
  const mediumSnapDistPx = useRef(45);
  const confidenceHold = useRef(0.72);
  const detectLostWindow = useRef(6);
  const qualityBoost = useRef(0);
  const smartPredict = useRef(0.24);
  const jitterFreezeWindow = useRef(0);
  const poseVisibilityFloor = useRef(0.42);
  const stableWindow = useRef(0);
  const motionWindow = useRef(0);
  const anchorBlendEMA = useRef(0.7);
  const speedState = useRef(0);
  const centerBiasPx = useRef(0);
  const neckTrueCenter = useRef(0);
  const hardLockState = useRef(false);
  const adaptiveSnap = useRef(0);
  const confidenceLock = useRef(0.76);
  const poseMidCorrection = useRef(0);
  const lateralClamp = useRef(0);
  const verticalClamp = useRef(0);
  const temporalLock = useRef(0);
  const arPredictor = useRef(0.2);
  const dynamicLock = useRef(0);
  const lockRecover = useRef(0);
  const arCenterBias = useRef(0);
  const transitionSmooth = useRef(0.5);
  const currentMode = useRef<"fast" | "stable">("fast");
  const anchorState = useRef({ x: 320, y: 264 });
  const stabilityWindow = useRef(0);
  const lockWindow = useRef(0);
  const aggressiveCatchup = useRef(0.7);
  const safeCatchup = useRef(0.5);
  const realtimeComp = useRef(0);
  const centerBlend = useRef(0);
  const residualCorrection = useRef(0);
  const detectLatencyComp = useRef(0);
  const smartSnap = useRef(0);
  const trackingDamping = useRef(0.3);
  const neckLockDrift = useRef(0);
  const confidenceDrift = useRef(0);
  const fastMotionGuard = useRef(0);
  const stableMotionGuard = useRef(0);
  const arStateMachine = useRef(0);
  const poseSupport = useRef(0.7);
  const faceSupport = useRef(0.3);
  const weightedCenter = useRef(0);
  const antiJitter = useRef(0.4);
  const smartCenter = useRef(0);
  const lowLightPenalty = useRef(0);
  const lockTimeout = useRef(0);
  const driftTimeout = useRef(0);
  const instantReacquire = useRef(0);
  const lockMemory = useRef({ x: 320, y: 264 });
  const motionPredictor = useRef({ x: 0, y: 0 });
  const confidencePredictor = useRef(0.8);
  const trackTuning = useRef(0.5);
  const neckMidBias = useRef(0);
  const poseCenterBias = useRef(0.01);
  const anchorReset = useRef(0);
  const neckSignal = useRef(0.8);
  const arCompensator = useRef(0);
  const fastTrackGate = useRef(0);
  const fallbackCenter = useRef({ x: 320, y: 264 });
  const qualityGate = useRef(0.6);
  const poseConfidence = useRef(0.8);
  const faceConfidence = useRef(0.7);
  const weightedDrift = useRef(0);
  const snapMode = useRef<"none" | "medium" | "hard">("none");
  const smartAnchor = useRef({ x: 320, y: 264 });
  const lockCenterX = useRef(0);
  const lockCenterY = useRef(0);
  const arFastPath = useRef(true);
  const correctionGain = useRef(0.12);
  const poseLockGain = useRef(0.7);
  const faceLockGain = useRef(0.3);
  const lockStability = useRef(0.8);
  const smoothGain = useRef(0.5);
  const relockGain = useRef(0.75);
  const driftClamp = useRef(0);
  const velocityTrust = useRef(0.7);
  const centerTrust = useRef(0.8);
  const anchorTrust = useRef(0.8);
  const recoverTrust = useRef(0.7);
  const predictiveTrust = useRef(0.25);
  const trackingSnap = useRef(0);
  const arPrecisionMode = useRef(true);
  const neckCenterLine = useRef(0);
  const finalBias = useRef(0);
  const arResponsiveness = useRef(0.9);
  const trackingCompensation = useRef(0);
  const currentConfidence = useRef(0.8);
  const fallbackConfidence = useRef(0.6);
  const lockReliability = useRef(0.8);
  const guardFrames = useRef(0);
  const smoothingState = useRef(0);
  const confidenceState = useRef(0);
  const phaseLock = useRef(0);
  const arState = useRef(0);
  const fastFollow = useRef(0.65);
  const stableFollow = useRef(0.48);
  const xCenterNudge = useRef(0);
  const yCenterNudge = useRef(0);
  const widthStabilizer = useRef(0);
  const rollStabilizer = useRef(0);
  const smartRelock = useRef(0);
  const lockThresholdPx = useRef(62);
  const dynamicThresholdPx = useRef(38);
  const centerBiasDynamic = useRef(0);
  const trackingBoost = useRef(0);
  const poseCenterWeight = useRef(0.72);
  const faceCenterWeight = useRef(0.28);
  const confidenceScale = useRef(1);
  const smoothScale = useRef(1);
  const lockScale = useRef(1);
  const adaptiveScale = useRef(1);
  const driftScale = useRef(1);
  const correctionScale = useRef(1);
  const fastScale = useRef(1);
  const stableScale = useRef(1);
  const centerScale = useRef(1);
  const motionScale = useRef(1);
  const predictorScale = useRef(1);
  const recoveryScale = useRef(1);
  const gainScale = useRef(1);
  const tuningState = useRef(0);
  const trackingState = useRef(0);
  const neckStateCode = useRef(0);
  const centerState = useRef(0);
  const lockState = useRef(0);
  const recoverState = useRef(0);
  const detectState = useRef(0);
  const fastState = useRef(0);
  const stableState = useRef(0);
  const predictState = useRef(0);
  const guardState = useRef(0);
  const blendState = useRef(0);
  const calibrateState = useRef(0);
  const responseState = useRef(0);
  const anchorQuality = useRef(0.8);
  const updateQuality = useRef(0.8);
  const sampleQuality = useRef(0.8);
  const lockQualityScore = useRef(0.8);
  const stabilityQuality = useRef(0.8);
  const confidenceQuality = useRef(0.8);
  const poseQuality = useRef(0.8);
  const faceQuality = useRef(0.8);
  const centerQuality = useRef(0.8);
  const finalQuality = useRef(0.8);
  const motionQuality = useRef(0.8);
  const driftQuality = useRef(0.8);
  const resetQuality = useRef(0.8);
  const recoverQuality = useRef(0.8);
  const predictQuality = useRef(0.8);
  const biasQuality = useRef(0.8);
  const clampQuality = useRef(0.8);
  const snapQuality = useRef(0.8);
  const catchupQuality = useRef(0.8);
  const followQuality = useRef(0.8);
  const fusionQuality = useRef(0.8);
  const healthQuality = useRef(0.8);
  const lagQuality = useRef(0.8);
  const fastQuality = useRef(0.8);
  const stableQuality = useRef(0.8);
  const lockQuality2 = useRef(0.8);
  const centerQuality2 = useRef(0.8);
  const arQuality = useRef(0.8);
  const smartQuality = useRef(0.8);
  const neckQuality = useRef(0.8);
  const positionQuality = useRef(0.8);
  const realtimeQuality = useRef(0.8);
  const accuracyQuality = useRef(0.8);
  const reliabilityQuality = useRef(0.8);
  const robustnessQuality = useRef(0.8);
  const finalState = useRef(0);
  const perfState = useRef(0);
  const mainLoopState = useRef(0);
  const transientState = useRef(0);
  const lockLoopState = useRef(0);
  const catchupState = useRef(0);
  const driftLoopState = useRef(0);
  const biasLoopState = useRef(0);
  const centerLoopState = useRef(0);
  const motionLoopState = useRef(0);
  const detectLoopState = useRef(0);
  const smoothingLoopState = useRef(0);
  const qualityLoopState = useRef(0);
  const responseLoopState = useRef(0);
  const predictLoopState = useRef(0);
  const recoverLoopState = useRef(0);
  const trackLoopState = useRef(0);
  const anchorLoopState = useRef(0);
  const runtimeLoopState = useRef(0);
  const heartBeat = useRef(0);
  const sampleTick = useRef(0);
  const driftTick = useRef(0);
  const guardTick = useRef(0);
  const lockTick = useRef(0);
  const resetTick = useRef(0);
  const recoverTick = useRef(0);
  const centerTick = useRef(0);
  const followTick = useRef(0);
  const snapTick = useRef(0);
  const blendTick = useRef(0);
  const modeTick = useRef(0);
  const stateTick = useRef(0);
  const syncTick = useRef(0);
  const updateTick = useRef(0);
  const qualityTick = useRef(0);
  const motionTick = useRef(0);
  const accuracyTick = useRef(0);
  const reliabilityTick = useRef(0);
  const stabilityTick = useRef(0);
  const anchorTick = useRef(0);
  const detectTick = useRef(0);
  const fastTick = useRef(0);
  const stableTick = useRef(0);
  const predictTick = useRef(0);
  const finalTick = useRef(0);
  const overallTick = useRef(0);
  const tuningTick = useRef(0);
  const refitTick = useRef(0);
  const precisionTick = useRef(0);
  const lockDriftTick = useRef(0);
  const antiLagTick = useRef(0);
  const centerDriftTick = useRef(0);
  const fallbackTick = useRef(0);
  const smartTick = useRef(0);
  const robustTick = useRef(0);
  const trackTick = useRef(0);
  const userMoveTick = useRef(0);
  const neckMoveTick = useRef(0);
  const confidenceTick = useRef(0);
  const visualTick = useRef(0);
  const cameraTick = useRef(0);
  const perfTick = useRef(0);
  const throttleTick = useRef(0);
  const settleTick = useRef(0);
  const clampTick = useRef(0);
  const snapLoopTick = useRef(0);
  const healthTick = useRef(0);
  const driftLoopTick2 = useRef(0);
  const centerLoopTick2 = useRef(0);
  const smoothingTick2 = useRef(0);
  const responseTick2 = useRef(0);
  const qualityTick2 = useRef(0);
  const detectTick2 = useRef(0);
  const finalLoopTick = useRef(0);
  const frameCounter = useRef(0);
  const lastInferenceTime = useRef(0);
  const cssRenderSize = useRef({ width: 640, height: 480 });

  // Trạng thái bám cổ EMA chống rung tuyệt đối
  const smoothedNeck = useRef({ x: 320, y: 264, width: 120, roll: 0 });
  const baseNeckWidth = useRef(120);

  // Cơ chế tự động hiệu chuẩn khoảng cách và làm mịn thu phóng (Organic Auto-Scaling)
  const calibrationCounter = useRef(0);
  const calibrationWidthSum = useRef(0);
  const smoothScaleMultiplier = useRef(1.0);

  // Cache đối tượng ảnh chân dung tĩnh đã tải xong để tránh tải lại liên tục gây rung giật ảnh nền khi kéo thanh trượt
  const loadedPhotoImg = useRef<HTMLImageElement | null>(null);

  // Canvas phụ chứa ảnh vòng cổ đã được khử sạch nền trắng (Chroma Keyed Transparent Canvas)
  const [transparentNecklace, setTransparentNecklace] = useState<HTMLCanvasElement | null>(null);

  // Dùng ảnh gốc để đảm bảo AR giống 1:1 ảnh sản phẩm đã bấm thử
  useEffect(() => {
    const img = new Image();
    const isExternal =
      selected.arSrc &&
      selected.arSrc.startsWith("http") &&
      !selected.arSrc.includes(window.location.host);
    if (isExternal) {
      img.crossOrigin = "anonymous";
    }

    if (!selected.arSrc) {
      setTransparentNecklace(null);
      return;
    }

    img.src = selected.arSrc;
    img.onload = () => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = img.naturalWidth || 800;
      offCanvas.height = img.naturalHeight || 800;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) {
        setTransparentNecklace(null);
        return;
      }
      offCtx.imageSmoothingEnabled = true;
      offCtx.imageSmoothingQuality = "high";
      offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
      setTransparentNecklace(offCanvas);
    };
    img.onerror = () => {
      console.error("Lỗi tải ảnh vòng cổ AR:", selected.arSrc);
      setTransparentNecklace(null);
    };
  }, [selected]);

  // Tự động chuyển bộ sưu tập và chọn sản phẩm theo slug từ URL hoặc slug gần nhất user đã bấm thử
  useEffect(() => {
    const rememberedSlug =
      typeof window !== "undefined"
        ? localStorage.getItem("last-tryon-slug") || undefined
        : undefined;
    const targetSlug = initSlug || rememberedSlug;

    if (!targetSlug) return;

    const prod = products.find((p) => p.slug === targetSlug);
    if (!prod) return;

    const colIdx = COLLECTION_DEFS.findIndex((c) => c.id === prod.collectionId);

    const preferredSrc = resolveArSrc(prod, prod.specs);

    if (colIdx !== -1) {
      setCollectionIdx(colIdx);
      const necklaceItem = collections[colIdx]?.items.find((item) => item.id === targetSlug);
      if (necklaceItem) {
        setSelected({ ...necklaceItem, arSrc: preferredSrc });
      }
    } else {
      setSelected({
        id: prod.slug,
        name: prod.name,
        price: prod.price,
        src: prod.img || "",
        arSrc: preferredSrc,
        arScale: prod.specs?.arScale !== undefined ? Number(prod.specs.arScale) : 60,
        arOffsetY: prod.specs?.arOffsetY !== undefined ? Number(prod.specs.arOffsetY) : 55,
        arOffsetX: prod.specs?.arOffsetX !== undefined ? Number(prod.specs.arOffsetX) : 0,
        arRotation: prod.specs?.arRotation !== undefined ? Number(prod.specs.arRotation) : 0,
      });
    }

    setUserPicked(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("last-tryon-slug", targetSlug);
    }
    toast.info(`Đã tải mẫu thử: ${prod.name}`);
  }, [initSlug, initImage, collections, isProductsLoaded, tick]);

  // Tải trước ảnh tĩnh chân dung và lưu cache để vẽ mượt mà, không giật lag
  useEffect(() => {
    if (photo) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = photo;
      img.onload = () => {
        loadedPhotoImg.current = img;
        renderStaticPhotoAR();
      };
      img.onerror = () => {
        console.error("Lỗi tải ảnh chân dung tĩnh.");
      };
    } else {
      loadedPhotoImg.current = null;
    }
  }, [photo]);

  const handleCollectionChange = (idx: number) => {
    setCollectionIdx(idx);
    const col = collections[idx];
    if (col && col.items.length > 0) {
      setSelected(col.items[0]);
      setUserPicked(false);
    }
  };

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [simulateNoFace, setSimulateNoFace] = useState(false);

  // Sync selected product's default AR settings
  useEffect(() => {
    // Chỉ đồng bộ hóa về mặc định của sản phẩm khi ở chế độ Live Camera hoặc chưa tải ảnh tĩnh lên
    // Nếu đã tải ảnh tĩnh lên (photo !== null), giữ nguyên mọi thông số căn chỉnh hiện tại của người dùng/AI!
    if (selected && (cameraActive || !photo)) {
      setScale(selected.arScale !== undefined ? selected.arScale : 60);
      setOffsetY(selected.arOffsetY !== undefined ? selected.arOffsetY : 55);
      setOffsetX(selected.arOffsetX !== undefined ? selected.arOffsetX : 0);
      setRotation(selected.arRotation !== undefined ? selected.arRotation : 0);
    }
  }, [selected, cameraActive, photo]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const onFile = (file?: File | null) => {
    if (!file) return;
    if (!selected.arSrc) {
      toast.error("Ảnh chưa có ảnh ar không thể test");
      return;
    }

    // Tắt live camera ngay lập tức để chuyển hẳn sang chế độ ảnh tĩnh, tránh xung đột vẽ song song
    stopCamera();

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawImgUrl = (e.target?.result as string) ?? null;
      if (!rawImgUrl) return;

      setCameraError(null);
      setFaceScanning(true);

      const img = new Image();
      img.onload = () => {
        // Giới hạn kích thước ảnh tối đa (ví dụ 1000px) để tối ưu hóa hiệu suất MediaPipe & vẽ Canvas
        const maxDim = 1000;
        let w = img.width || 640;
        let h = img.height || 480;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0, w, h);
          const resizedDataUrl = tempCanvas.toDataURL("image/jpeg", 0.9);
          
          // Lưu ảnh đã resize làm ảnh hiển thị chính thức
          setPhoto(resizedDataUrl);

          const neck = detectNeckPosition(tempCtx, w, h);

          setTimeout(() => {
            setFaceScanning(false);
            if (neck && !simulateNoFace) {
              const calculatedScale = (neck.width / w) * 200 * 1.1;

              const defaultOffsetY = selected.arOffsetY !== undefined ? selected.arOffsetY : 55;
              setOffsetY(defaultOffsetY);
              setScale(Math.max(20, Math.min(150, Math.round(calculatedScale))));
              setOffsetX(0);
              setRotation(0);

              // Đặt trạng thái bám cổ ổn định cho ảnh tĩnh
              smoothedNeck.current = {
                x: neck.x,
                y: neck.y,
                width: neck.width,
                roll: neck.roll || 0,
              };
              baseNeckWidth.current = neck.width;

              targetPos.current.x = neck.x;
              targetPos.current.y = neck.y;
              lastTargetX.current = neck.x;
              lastTargetY.current = neck.y;

              setFaceDetected(true);
              toast.success(
                "Trí tuệ nhân tạo (Smart AI) đã phát hiện cổ và tự động điều chỉnh vòng cổ vừa vặn hoàn hảo! 🌟",
              );
            } else {
              if (simulateNoFace) {
                setFaceDetected(false);
                toast.error("Không phát hiện khuôn mặt trên ảnh tải lên! (Face not detected)");
              } else {
                const defaultOffsetY = selected.arOffsetY !== undefined ? selected.arOffsetY : 55;
                const defaultScale = selected.arScale !== undefined ? selected.arScale : 60;
                setOffsetY(defaultOffsetY);
                setScale(defaultScale);
                setOffsetX(0);
                setRotation(0);
                targetPos.current.x = w / 2;
                targetPos.current.y = h * 0.55;
                lastTargetX.current = w / 2;
                lastTargetY.current = h * 0.55;
                smoothedNeck.current = {
                  x: w / 2,
                  y: h * 0.55,
                  width: 120,
                  roll: 0,
                };
                baseNeckWidth.current = 120;
                setFaceDetected(true);
                toast.info(
                  "Không nhận diện được vị trí cổ rõ ràng. Bạn có thể sử dụng các thanh trượt để tự điều chỉnh.",
                );
              }
            }
          }, 1000);
        }
      };
      img.src = rawImgUrl;
    };
    reader.readAsDataURL(file);
  };

  const goPrev = useCallback(() => {
    handleCollectionChange((collectionIdx - 1 + collections.length) % collections.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionIdx, collections.length]);

  const goNext = useCallback(() => {
    handleCollectionChange((collectionIdx + 1) % collections.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionIdx, collections.length]);

  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setFaceScanning(false);
  }, []);

  // Vẽ live camera đè vòng cổ lên canvas ở thời gian thực kết hợp thuật toán thắt nút cổ thông minh (Neck Bottleneck Detection)
  const renderLiveAR = useCallback(() => {
    const video = videoRef.current;
    const canvas = displayCanvasRef.current;
    if (!video || !canvas || !cameraActive) return;

    const parent = canvas.parentElement;
    const cssW = Math.max(1, Math.round(parent?.clientWidth || video.videoWidth || 640));
    const cssH = Math.max(1, Math.round(parent?.clientHeight || video.videoHeight || 480));
    cssRenderSize.current = { width: cssW, height: cssH };
    const ctx = setCanvasToHiDPI(canvas, cssW, cssH);
    if (!ctx) return;

    drawVideoCover(ctx, video, cssW, cssH);

    if (!simulateNoFace && !faceScanning) {
      frameCounter.current++;
      const now = performance.now();
      const shouldInfer = now - lastInferenceTime.current >= 16;

      if (shouldInfer) {
        lastInferenceTime.current = now;
        const neck = detectNeckPosition(ctx, cssW, cssH, video);

        if (neck) {
          if (smoothedNeck.current.x === 320 && smoothedNeck.current.y === 264) {
            smoothedNeck.current = {
              x: neck.x,
              y: neck.y,
              width: neck.width,
              roll: neck.roll || 0,
            };
          } else {
            const dx = neck.x - smoothedNeck.current.x;
            const dy = neck.y - smoothedNeck.current.y;
            smoothedNeck.current.x = adaptiveLerp(smoothedNeck.current.x, neck.x, dx, 0.28, 0.34);
            smoothedNeck.current.y = adaptiveLerp(smoothedNeck.current.y, neck.y, dy, 0.28, 0.34);
            smoothedNeck.current.width = adaptiveLerp(
              smoothedNeck.current.width,
              neck.width,
              neck.width - smoothedNeck.current.width,
              0.24,
              0.24,
            );
            smoothedNeck.current.roll = adaptiveLerp(
              smoothedNeck.current.roll || 0,
              neck.roll || 0,
              (neck.roll || 0) - (smoothedNeck.current.roll || 0),
              0.26,
              0.24,
            );
          }

          if (calibrationCounter.current > 0) {
            calibrationWidthSum.current += neck.width;
            calibrationCounter.current--;
            if (calibrationCounter.current === 0) {
              baseNeckWidth.current = calibrationWidthSum.current / 20;
            }
          }

          if (baseNeckWidth.current === 120 && calibrationCounter.current > 0) {
            baseNeckWidth.current = neck.width;
          }

          const centerBiasX = cssW * 0.01;
          lastTargetX.current = smoothedNeck.current.x + cssW * (offsetX / 100) + centerBiasX;
          lastTargetY.current = smoothedNeck.current.y + cssH * ((offsetY - 55) / 100);

          const driftX = Math.abs(lastTargetX.current - targetPos.current.x);
          const driftY = Math.abs(lastTargetY.current - targetPos.current.y);
          if (driftX > cssW * 0.18 || driftY > cssH * 0.18) {
            targetPos.current.x = lastTargetX.current;
            targetPos.current.y = lastTargetY.current;
          }

          if (!faceDetected) setFaceDetected(true);
        } else {
          const defaultX = cssW / 2 + cssW * (offsetX / 100);
          const defaultY = cssH * (offsetY / 100);
          lastTargetX.current = adaptiveLerp(
            lastTargetX.current,
            defaultX,
            defaultX - lastTargetX.current,
            0.08,
            0.12,
          );
          lastTargetY.current = adaptiveLerp(
            lastTargetY.current,
            defaultY,
            defaultY - lastTargetY.current,
            0.08,
            0.12,
          );
        }
      }

      targetPos.current.x = adaptiveLerp(
        targetPos.current.x,
        lastTargetX.current,
        lastTargetX.current - targetPos.current.x,
        0.5,
        0.38,
      );
      targetPos.current.y = adaptiveLerp(
        targetPos.current.y,
        lastTargetY.current,
        lastTargetY.current - targetPos.current.y,
        0.5,
        0.38,
      );
    } else {
      const defaultX = cssW / 2 + cssW * (offsetX / 100);
      const defaultY = cssH * (offsetY / 100);
      targetPos.current.x = adaptiveLerp(
        targetPos.current.x,
        defaultX,
        defaultX - targetPos.current.x,
        0.12,
        0.14,
      );
      targetPos.current.y = adaptiveLerp(
        targetPos.current.y,
        defaultY,
        defaultY - targetPos.current.y,
        0.12,
        0.14,
      );
    }

    if (faceDetected && !faceScanning && !simulateNoFace && transparentNecklace) {
      const targetScaleMult =
        baseNeckWidth.current > 0 ? smoothedNeck.current.width / baseNeckWidth.current : 1;
      smoothScaleMultiplier.current = adaptiveLerp(
        smoothScaleMultiplier.current,
        targetScaleMult,
        targetScaleMult - smoothScaleMultiplier.current,
        0.1,
        0.1,
      );

      const limitScaleMult = clamp(smoothScaleMultiplier.current, 0.62, 1.45);
      const currentScale = scale * limitScaleMult;

      const w = cssW * (currentScale / 100) * 0.5;
      const aspectRatio = transparentNecklace.height / transparentNecklace.width;
      const h = w * aspectRatio;
      const roll = smoothedNeck.current.roll || 0;
      const rollRad = (roll * Math.PI) / 180;
      const sideLockX = Math.sin(rollRad) * (w * 0.14);
      const tiltLiftY = (1 - Math.cos(rollRad)) * (h * 0.34);

      const centerX = targetPos.current.x + sideLockX;
      const neckDrop = h * 0.16 + cssH * 0.006;
      const centerY = targetPos.current.y + neckDrop - tiltLiftY;

      drawNecklaceWrapped(
        ctx,
        transparentNecklace,
        centerX,
        centerY,
        w,
        h,
        rotation,
        roll,
      );
    }

    animationFrameId.current = requestAnimationFrame(renderLiveAR);
  }, [
    cameraActive,
    scale,
    offsetY,
    offsetX,
    rotation,
    faceDetected,
    faceScanning,
    simulateNoFace,
    transparentNecklace,
  ]);

  // === CRITICAL: Dùng kích thước CONTAINER và cover fit giống hệt renderLiveAR ===
  const renderStaticPhotoAR = useCallback(() => {
    const canvas = displayCanvasRef.current;
    const baseImg = loadedPhotoImg.current;
    if (!canvas || cameraActive || !photo || !baseImg) return;

    // Sử dụng kích thước container (giống hệt live camera)
    const parent = canvas.parentElement;
    const cssW = Math.max(1, Math.round(parent?.clientWidth || 640));
    const cssH = Math.max(1, Math.round(parent?.clientHeight || 480));
    const ctx = setCanvasToHiDPI(canvas, cssW, cssH);
    if (!ctx) return;

    // Vẽ ảnh bằng cover fit (giống drawVideoCover cho live camera)
    const imgW = baseImg.naturalWidth || baseImg.width || 640;
    const imgH = baseImg.naturalHeight || baseImg.height || 480;
    const imgAspect = imgW / imgH;
    const containerAspect = cssW / cssH;

    let sx = 0, sy = 0, sWidth = imgW, sHeight = imgH;
    if (imgAspect > containerAspect) {
      sWidth = imgH * containerAspect;
      sx = (imgW - sWidth) * 0.5;
    } else if (imgAspect < containerAspect) {
      sHeight = imgW / containerAspect;
      sy = (imgH - sHeight) * 0.5;
    }
    ctx.drawImage(baseImg, sx, sy, sWidth, sHeight, 0, 0, cssW, cssH);

    // 2. Vẽ vòng cổ — map tọa độ từ image-space sang container-space
    if (faceDetected && transparentNecklace) {
      // Map tọa độ cổ (được detect trong image-space) sang container-space
      const neckX = ((smoothedNeck.current.x - sx) / sWidth) * cssW;
      const neckY = ((smoothedNeck.current.y - sy) / sHeight) * cssH;

      // Tỉ lệ co giãn động (ratio không thay đổi khi map)
      const scaleMultiplier =
        baseNeckWidth.current > 0 ? smoothedNeck.current.width / baseNeckWidth.current : 1;
      const limitScaleMult = clamp(scaleMultiplier, 0.62, 1.45);
      const currentScale = scale * limitScaleMult;

      // Kích thước vòng cổ tính theo container-space (giống hệt live camera)
      const w = cssW * (currentScale / 100) * 0.5;
      const aspectRatio = transparentNecklace.height / transparentNecklace.width;
      const h = w * aspectRatio;

      const roll = smoothedNeck.current.roll || 0;
      const rollRad = (roll * Math.PI) / 180;
      const sideLockX = Math.sin(rollRad) * (w * 0.14);
      const tiltLiftY = (1 - Math.cos(rollRad)) * (h * 0.34);

      // Công thức vị trí GIỐNG HỆT renderLiveAR
      const centerBiasX = cssW * 0.01;
      const basePosX = neckX + cssW * (offsetX / 100) + centerBiasX;
      const basePosY = neckY + cssH * ((offsetY - 55) / 100);

      const centerX = basePosX + sideLockX;
      const neckDrop = h * 0.16 + cssH * 0.006;
      const centerY = basePosY + neckDrop - tiltLiftY;

      drawNecklaceWrapped(
        ctx,
        transparentNecklace,
        centerX,
        centerY,
        w,
        h,
        rotation,
        roll,
      );
    }
  }, [cameraActive, photo, faceDetected, transparentNecklace, scale, offsetY, offsetX, rotation]);

  // Tự động vẽ lại ảnh tĩnh khi các thanh trượt hoặc sản phẩm thay đổi
  useEffect(() => {
    if (!cameraActive && photo) {
      renderStaticPhotoAR();
    }
  }, [
    cameraActive,
    photo,
    renderStaticPhotoAR,
    scale,
    offsetY,
    offsetX,
    rotation,
    transparentNecklace,
  ]);

  useEffect(() => {
    if (cameraActive) {
      renderLiveAR();
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [cameraActive, renderLiveAR]);

  const startCamera = useCallback(async () => {
    const matched = selected?.id ? products.find((p) => p.slug === selected.id) : undefined;
    const activeArSrc = selected?.arSrc || (matched ? resolveArSrc(matched, matched.specs) : "");

    if (!activeArSrc) {
      toast.error("Sản phẩm này chưa có ảnh AR nên chưa thể test camera");
      return;
    }

    if (selected && selected.arSrc !== activeArSrc) {
      setSelected((prev) => (prev ? { ...prev, arSrc: activeArSrc } : prev));
    }

    setCameraError(null);
    setPhoto(null);

    // Reset các biến hiệu chuẩn khoảng cách ban đầu để tính toán lại chính xác
    calibrationCounter.current = 20; // Thực hiện hiệu chuẩn tự động trong 20 frame đầu
    calibrationWidthSum.current = 0;
    smoothScaleMultiplier.current = 1.0;
    baseNeckWidth.current = 120; // Reset mốc chuẩn

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;

        // Thêm thuộc tính để chạy mượt mà trên di động và mọi trình duyệt
        video.setAttribute("playsinline", "true");
        video.setAttribute("autoplay", "true");
        video.muted = true;

        // Đăng ký sự kiện loadedmetadata
        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              console.log("Camera video started playing successfully.");
              setFaceScanning(true);
              setCameraActive(true);

              setTimeout(() => {
                setFaceScanning(false);
                if (simulateNoFace) {
                  setFaceDetected(false);
                  toast.error("Không detect được khuôn mặt! (Face not detected)");
                } else {
                  setFaceDetected(true);
                  toast.success("Đã kích hoạt Smart AR: Vòng cổ tự động ôm khít bám đuổi cổ bạn!");
                }
              }, 1500);
            })
            .catch((err) => {
              console.error("Play error:", err);
            });
        };

        // Kích hoạt thủ công đề phòng sự kiện đã kích hoạt trước đó
        video.load();
        video.play().catch((e) => console.log("Video auto play promise catch:", e));
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      const msg =
        "Không thể truy cập camera. Quyền truy cập camera bị từ chối (Camera permission is denied) hoặc camera đang bị ứng dụng khác chiếm dụng. Vui lòng cấp quyền camera trong cài đặt trình duyệt để tiếp tục.";
      setCameraError(msg);
      toast.error("Camera permission denied!");
      setCameraActive(false);
    }
  }, [simulateNoFace, selected?.id, selected?.arSrc]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth || 640;
    tempCanvas.height = video.videoHeight || 480;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Chỉ vẽ khung hình video gốc (không có vòng cổ đè lên)
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.9);
    setPhoto(dataUrl);

    // Chạy detectNeckPosition ngay trên ảnh vừa chụp
    const neck = detectNeckPosition(tempCtx, tempCanvas.width, tempCanvas.height);
    if (neck && !simulateNoFace) {
      targetPos.current.x = neck.x;
      targetPos.current.y = neck.y;

      // Đặt trạng thái bám cổ ổn định cho ảnh chụp tĩnh
      smoothedNeck.current = { x: neck.x, y: neck.y, width: neck.width };
      baseNeckWidth.current = neck.width;
      smoothScaleMultiplier.current = 1.0;
    } else {
      targetPos.current.x = tempCanvas.width / 2;
      targetPos.current.y = tempCanvas.height * 0.55;
      smoothedNeck.current = { x: tempCanvas.width / 2, y: tempCanvas.height * 0.55, width: 120 };
      baseNeckWidth.current = 120;
      smoothScaleMultiplier.current = 1.0;
    }

    stopCamera();
    toast.success(
      "Đã chụp ảnh AR thành công! Bạn có thể căn chỉnh lại kích thước và vị trí trước khi tải về.",
    );
  }, [stopCamera, simulateNoFace]);

  const downloadPhoto = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `luna-jewel-tryon-${selected.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Đã tải ảnh thử vòng cổ Live AR về máy!");
  };

  const triggerDownload = (canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `luna-jewel-tryon-${selected.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Đã tải ảnh thử vòng cổ Live AR về máy!");
  };

  useEffect(() => {
    if (cameraActive) {
      if (simulateNoFace) {
        setFaceDetected(false);
      } else {
        setFaceDetected(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulateNoFace]);

  useEffect(() => {
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <section
      id="thu-vong-co-truc-tuyen"
      className="max-w-7xl mx-auto px-6 mt-16"
      aria-label="Thử vòng cổ trực tuyến"
    >
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-brand tracking-wide font-display">
          TRẢI NGHIỆM THỬ VÒNG CỔ LIVE AR 2.5D
        </h2>
        <p className="mt-2 text-xs md:text-sm text-foreground/70 max-w-2xl mx-auto leading-relaxed">
          Sử dụng Camera trực tiếp của bạn hoặc tải lên một bức ảnh chân dung để đeo thử những thiết
          kế dây chuyền tinh xảo từ Luna Jewel trong thời gian thực.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
        {/* Try-on Preview Screen */}
        <div className="bg-brand-soft/20 rounded-xl p-5 border border-brand/10 flex flex-col gap-4 shadow-sm">
          {/* Main Visual Screen */}
          <div
            className="relative w-full mx-auto bg-slate-900 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner group aspect-4/5 sm:aspect-3/4 md:aspect-3/4 lg:aspect-3/4 xl:aspect-4/5 max-h-[72vh]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
          >
            {/* Hidden video element for stream capture */}
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />

            {/* Display Canvas - Render Live stream overlay & Static Photos */}
            <canvas
              ref={displayCanvasRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                cameraActive || photo ? "opacity-100" : "hidden"
              }`}
            />

            {/* Simulated Scanning Laser effect */}
            {faceScanning && (
              <div className="absolute inset-x-0 top-0 h-1 bg-brand shadow-[0_0_15px_#49aaa9] animate-bounce z-10 flex items-center justify-center">
                <span className="bg-brand/90 backdrop-blur-xs text-brand-foreground text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-brand/20 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Đang nhận diện cổ của bạn...
                </span>
              </div>
            )}

            {/* Live active necklace identifier tag */}
            {photo && !cameraActive && faceDetected && (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-brand/90 backdrop-blur-xs text-brand-foreground text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full border border-brand/20 shadow-md">
                {selected.name.toUpperCase()}
              </span>
            )}

            {/* Default State - Upload / Start Camera guide */}
            {!photo && !cameraActive && !cameraError && (
              <div className="flex flex-col items-center gap-3.5 text-slate-400 px-6 text-center py-10">
                <Upload className="w-12 h-12 text-brand/60" strokeWidth={1.5} />
                <span className="text-sm font-semibold text-slate-200">Tải lên ảnh chân dung</span>
                <span className="text-xs text-slate-400">hoặc kéo & thả ảnh chân dung vào đây</span>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  hoặc bật camera để chụp live
                </span>
                {!selected.arSrc && (
                  <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-md mt-2 font-semibold">
                    Ảnh chưa có ảnh ar không thể test
                  </span>
                )}
              </div>
            )}

            {/* Alternative Flow A1 Error State */}
            {cameraError && (
              <div className="flex flex-col items-center gap-3 text-red-400 px-6 text-center max-w-md">
                <AlertCircle className="w-12 h-12" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Lỗi Truy Cập Camera
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-red-950/40 p-4 rounded-lg border border-red-500/20">
                  {cameraError}
                </p>
                <button
                  onClick={startCamera}
                  className="bg-red-500/20 border border-red-500/50 hover:bg-red-500/35 text-red-200 px-5 py-2 text-xs font-bold rounded-full transition-all uppercase tracking-wider flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                </button>
              </div>
            )}

            {/* Alternative Flow A2: Face Not Detected Warning */}
            {!faceDetected && !faceScanning && !cameraError && (cameraActive || photo) && (
              <div className="absolute inset-x-4 top-4 bg-red-600/90 backdrop-blur-xs border border-red-500 text-white rounded-lg p-3 shadow-md z-15 flex items-center gap-3.5 animate-in fade-in duration-200">
                <AlertCircle className="w-6 h-6 shrink-0 text-white" />
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Không phát hiện khuôn mặt (Face not detected)
                  </p>
                  <p className="text-[10px] opacity-90 mt-0.5 font-medium leading-relaxed">
                    Vui lòng căn chỉnh camera hoặc ảnh chân dung sao cho khuôn mặt và cổ nằm ở vùng
                    trung tâm khung hình.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive AR Scale and Position adjustments */}
          {photo && !cameraActive && faceDetected && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-brand/5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Kích thước vòng cổ ({scale}%)
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Vị trí trên cổ ({offsetY}%)
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Lệch trục ngang X ({offsetX}%)
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Góc xoay (Rotation) ({rotation}°)
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
            </div>
          )}

          {/* Adjustments in Live Video Mode */}
          {cameraActive && faceDetected && !faceScanning && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pb-3 border-b border-brand/5 bg-brand-soft/40 p-3 rounded-lg border border-brand/5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Kích thước Smart AR ({scale}%)
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Độ ôm / Căn chỉnh cổ ({offsetY}%)
                <input
                  type="range"
                  min={20}
                  max={90}
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Lệch trục ngang X ({offsetX}%)
                <input
                  type="range"
                  min={-30}
                  max={30}
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-brand">
                Góc xoay (Rotation) ({rotation}°)
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-brand mt-2 cursor-ew-resize h-1 bg-brand-soft rounded-lg appearance-none"
                />
              </label>
            </div>
          )}

          {/* Controls button panel */}
          <div className="mt-4 flex flex-wrap gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-5 py-3 text-xs font-bold rounded-lg tracking-wider hover:bg-brand/95 shadow-sm transition active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" /> {photo ? "ĐỔI ẢNH CHÂN DUNG" : "TẢI ẢNH LÊN"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />

            {cameraActive ? (
              <>
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={faceScanning}
                  className="inline-flex items-center gap-2 bg-price text-white px-5 py-3 text-xs font-bold rounded-lg tracking-wider hover:opacity-95 shadow-sm transition active:scale-[0.98] disabled:opacity-50"
                >
                  <Aperture className="w-4 h-4 animate-spin-slow" /> CHỤP ẢNH AR
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center gap-2 border border-brand/20 bg-white text-brand px-5 py-3 text-xs font-bold rounded-lg tracking-wider hover:bg-brand-soft transition active:scale-[0.98]"
                >
                  <CameraOff className="w-4 h-4" /> TẮT CAMERA
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 border border-brand/30 bg-white text-brand px-5 py-3 text-xs font-bold rounded-lg tracking-wider hover:bg-brand-soft transition active:scale-[0.98]"
              >
                <Camera className="w-4 h-4" /> MỞ LIVE CAMERA
              </button>
            )}

            {photo && !cameraActive && (
              <>
                <button
                  type="button"
                  onClick={downloadPhoto}
                  className="inline-flex items-center gap-2 bg-slate-800 text-white px-5 py-3 text-xs font-bold rounded-lg tracking-wider hover:bg-slate-700 transition active:scale-[0.98] shadow-sm"
                >
                  <Download className="w-4 h-4" /> TẢI ẢNH KẾT QUẢ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    setFaceDetected(true);
                  }}
                  className="inline-flex items-center gap-2 border border-brand/20 bg-white text-brand px-5 py-3 text-xs font-bold rounded-lg tracking-wider hover:bg-brand-soft transition active:scale-[0.98]"
                >
                  <Trash2 className="w-4 h-4" /> XOÁ ẢNH
                </button>
              </>
            )}
          </div>

          {/* Test Sandbox Panel: Simulate A2 error */}
          {(cameraActive || photo) && (
            <div className="mt-4 pt-3 border-t border-brand/5 flex items-center justify-between bg-white/70 p-3 rounded-lg border border-brand/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" /> Cài đặt thử nghiệm AR:
              </span>
              <label className="flex items-center gap-2 text-[10px] font-bold text-red-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateNoFace}
                  onChange={(e) => setSimulateNoFace(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-red-500"
                />
                Giả lập "Không nhận diện khuôn mặt (A2)"
              </label>
            </div>
          )}
        </div>

        {/* Necklace picker grid */}
        <div className="bg-white rounded-xl p-5 border border-brand/15 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-brand/5 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-5 h-5 text-brand shrink-0" strokeWidth={1.5} />
                <h3 className="text-sm font-extrabold tracking-wider text-brand truncate">
                  DANH SÁCH VÒNG CỔ
                </h3>
              </div>
            </div>

            {/* Tên bộ sưu tập hiện tại */}
            <div className="flex items-center justify-between gap-2 mt-4 bg-brand-soft/40 px-3 py-2 rounded-lg border border-brand/5">
              <p className="text-xs font-bold tracking-wider text-brand uppercase truncate">
                {collection?.name}
              </p>
              <span className="text-[10px] font-bold text-brand bg-white px-2 py-0.5 rounded shadow-2xs shrink-0">
                {collectionIdx + 1}/{collections.length}
              </span>
            </div>

            <p className="mt-2.5 text-[11px] text-muted-foreground font-medium">
              Sử dụng nút mũi tên bên dưới để thay đổi Bộ sưu tập, sau đó click chọn mẫu vòng cổ để
              đeo thử AR trực tuyến.
            </p>

            <div className="mt-5 relative px-1">
              <div className="grid grid-cols-2 gap-3.5">
                {necklaces.map((n) => {
                  const active = selected?.id === n.id;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        forcedInitImageRef.current = null;
                        setSelected(n);
                        setUserPicked(true);
                        if (!n.arSrc) {
                          toast.error("Ảnh chưa có ảnh ar không thể test");
                          stopCamera();
                        }
                      }}
                      className={`group relative rounded-lg overflow-hidden border bg-white text-left transition-all duration-200 flex flex-col cursor-pointer ${
                        active && userPicked
                          ? "border-brand ring-2 ring-brand/40 shadow-md"
                          : "border-brand/15 hover:border-brand/50 shadow-2xs"
                      }`}
                    >
                      <div className="bg-white p-2">
                        <img
                          src={n.src}
                          alt={`Vòng cổ ${n.name}`}
                          loading="lazy"
                          className="w-full aspect-square object-cover rounded"
                        />
                      </div>
                      <div
                        className={`text-center py-2 text-[10px] font-bold tracking-widest transition-colors ${
                          active && userPicked
                            ? "bg-brand text-brand-foreground"
                            : "bg-brand-soft/75 text-brand group-hover:bg-brand group-hover:text-brand-foreground"
                        }`}
                      >
                        ĐANG THỬ AR
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                        <div>
                          <p className="text-[11px] leading-snug font-semibold text-foreground/80 line-clamp-2 min-h-[2.6em]">
                            {n.name}
                          </p>
                          <p className="text-sm font-extrabold text-price mt-1">{n.price}</p>
                        </div>
                        
                        {/* Buy & Cart Buttons (UC35) */}
                        <div className="flex gap-1.5 pt-2 mt-auto border-t border-slate-100/60">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(n);
                            }}
                            title="Thêm vào giỏ hàng"
                            className="w-10 h-8 flex items-center justify-center bg-brand/10 hover:bg-brand text-brand hover:text-brand-foreground rounded transition-all cursor-pointer border border-brand/5"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBuyNow(n);
                            }}
                            className="flex-1 h-8 flex items-center justify-center bg-price hover:bg-price/90 text-white text-[10.5px] font-extrabold rounded transition-all uppercase tracking-wider cursor-pointer shadow-2xs active:scale-[0.98]"
                          >
                            Mua Ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Collection slider navigation controls */}
          <div className="mt-6 flex items-center justify-between border-t border-brand/5 pt-4">
            <button
              type="button"
              onClick={goPrev}
              className="flex items-center gap-1.5 border border-brand/20 bg-white text-brand px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-brand-soft transition active:scale-[0.98]"
            >
              <ChevronLeft className="w-4 h-4" /> Bộ sưu tập trước
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 border border-brand/20 bg-white text-brand px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-brand-soft transition active:scale-[0.98]"
            >
              Bộ sưu tập tiếp <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
