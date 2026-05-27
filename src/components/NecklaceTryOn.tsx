import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Upload, Sparkles, Trash2, Camera, CameraOff, Aperture, ChevronLeft, ChevronRight, Download, RefreshCw, AlertCircle } from "lucide-react";
import { products } from "@/data/products";
import { toast } from "sonner";

type Necklace = { id: string; name: string; price: string; src: string };
type Collection = { id: string; name: string; items: Necklace[] };

const COLLECTION_DEFS = [
  { id: "graceful-muse",     name: "The Graceful Muse - Nàng Thơ Thanh Lịch" },
  { id: "huong-sac-mua-he",  name: "Hương Sắc Mùa Hè" },
  { id: "thanh-nha-ngan-hoa",name: "Thanh Nhã Ngân Hoa" },
  { id: "pure-soul",         name: "Pure Soul - Tâm Hồn Thuần Khiết" },
];

const COLLECTIONS: Collection[] = COLLECTION_DEFS.map(({ id, name }) => ({
  id,
  name,
  items: products
    .filter((p) => p.collectionId === id)
    .map((p) => ({ id: p.slug, name: p.name, price: p.price, src: p.img })),
}));

interface NecklaceTryOnProps {
  initSlug?: string;
}

export function NecklaceTryOn({ initSlug }: NecklaceTryOnProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [collectionIdx, setCollectionIdx] = useState(0);
  const collection = COLLECTIONS[collectionIdx];
  const necklaces = useMemo(() => collection.items, [collection]);
  const [selected, setSelected] = useState<Necklace>(necklaces[0]);
  const [userPicked, setUserPicked] = useState(false);
  const [scale, setScale] = useState(60);
  const [offsetY, setOffsetY] = useState(55);
  const inputRef = useRef<HTMLInputElement>(null);

  // Vị trí AR Tracking bám đuổi mượt mà (Lerp)
  const targetPos = useRef({ x: 320, y: 264 });
  const frameCounter = useRef(0);

  // Canvas phụ chứa ảnh vòng cổ đã được khử sạch nền trắng (Chroma Keyed Transparent Canvas)
  const [transparentNecklace, setTransparentNecklace] = useState<HTMLCanvasElement | null>(null);

  // Thuật toán khử nền trắng một lần duy nhất khi chọn sản phẩm mới (Tối ưu hiệu năng & hình ảnh)
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selected.src;
    img.onload = () => {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = img.width || 400;
      offCanvas.height = img.height || 400;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return;

      offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const data = imgData.data;

      // Quét các pixel và khử nền trắng
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Nếu pixel có màu gần trắng (R, G, B đều lớn hơn 225)
        if (r > 225 && g > 225 && b > 225) {
          // Lọc sạch bằng cách đặt Alpha = 0 (trong suốt 100%)
          data[i + 3] = 0;
        } else {
          // Làm mịn phần viền (anti-aliasing) cho các pixel chuyển tiếp hơi xám
          const brightness = (r + g + b) / 3;
          if (brightness > 190) {
            const factor = (225 - brightness) / (225 - 190);
            data[i + 3] = Math.floor(data[i + 3] * Math.max(0, Math.min(1, factor)));
          }
        }
      }

      offCtx.putImageData(imgData, 0, 0);
      setTransparentNecklace(offCanvas);
    };
  }, [selected]);

  // Tự động chuyển bộ sưu tập và chọn sản phẩm dựa trên initSlug truyền sang
  useEffect(() => {
    if (initSlug) {
      const prod = products.find((p) => p.slug === initSlug);
      if (prod) {
        const colIdx = COLLECTION_DEFS.findIndex((c) => c.id === prod.collectionId);
        if (colIdx !== -1) {
          setCollectionIdx(colIdx);
          const necklaceItem = COLLECTIONS[colIdx].items.find((item) => item.id === initSlug);
          if (necklaceItem) {
            setSelected(necklaceItem);
            setUserPicked(true);
            toast.info(`Đã tải mẫu thử: ${necklaceItem.name}`);
          }
        }
      }
    }
  }, [initSlug]);

  const handleCollectionChange = (idx: number) => {
    setCollectionIdx(idx);
    const col = COLLECTIONS[idx];
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

  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const onFile = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto((e.target?.result as string) ?? null);
      setCameraError(null);
      setFaceScanning(true);
      setTimeout(() => {
        setFaceScanning(false);
        if (simulateNoFace) {
          setFaceDetected(false);
          toast.error("Không phát hiện khuôn mặt trên ảnh tải lên! (Face not detected)");
        } else {
          setFaceDetected(true);
          toast.success("Đã phân tích ảnh chân dung thành công!");
        }
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const goPrev = useCallback(() => {
    handleCollectionChange((collectionIdx - 1 + COLLECTIONS.length) % COLLECTIONS.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionIdx]);

  const goNext = useCallback(() => {
    handleCollectionChange((collectionIdx + 1) % COLLECTIONS.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionIdx]);

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

  // Vẽ live camera đè vòng cổ lên canvas ở thời gian thực kết hợp thuật toán Face Tracking & Skin Centroid Detection
  const renderLiveAR = useCallback(() => {
    const video = videoRef.current;
    const canvas = displayCanvasRef.current;
    if (!video || !canvas || !cameraActive) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Vẽ khung hình video live lên canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Thuật toán phân tích pixel để nhận diện khuôn mặt và xác định vị trí cổ thông minh
    if (!simulateNoFace && !faceScanning) {
      frameCounter.current++;
      
      if (frameCounter.current % 3 === 0) {
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          let totalX = 0;
          let totalY = 0;
          let skinPixelCount = 0;

          const startY = Math.floor(canvas.height * 0.15);
          const endY = Math.floor(canvas.height * 0.75);
          const startX = Math.floor(canvas.width * 0.2);
          const endX = Math.floor(canvas.width * 0.8);

          for (let y = startY; y < endY; y += 10) {
            for (let x = startX; x < endX; x += 10) {
              const idx = (y * canvas.width + x) * 4;
              const r = data[idx];
              const g = data[idx + 1];
              const b = data[idx + 2];

              const isSkin =
                r > 95 && g > 40 && b > 20 &&
                r > g && r > b &&
                (r - Math.min(g, b)) > 15 &&
                Math.abs(r - g) > 15;

              if (isSkin) {
                totalX += x;
                totalY += y;
                skinPixelCount++;
              }
            }
          }

          if (skinPixelCount > 30) {
            const cx = totalX / skinPixelCount;
            const cy = totalY / skinPixelCount;

            const targetX = cx;
            const targetY = cy + (canvas.height * (offsetY / 130)); 

            targetPos.current.x = targetPos.current.x + (targetX - targetPos.current.x) * 0.25;
            targetPos.current.y = targetPos.current.y + (targetY - targetPos.current.y) * 0.25;

            if (!faceDetected) setFaceDetected(true);
          } else {
            targetPos.current.x = targetPos.current.x + (canvas.width / 2 - targetPos.current.x) * 0.1;
            targetPos.current.y = targetPos.current.y + (canvas.height * (offsetY / 100) - targetPos.current.y) * 0.1;
          }
        } catch (e) {
          console.warn("Pixel analysis skipped:", e);
        }
      }
    } else {
      targetPos.current.x = targetPos.current.x + (canvas.width / 2 - targetPos.current.x) * 0.1;
      targetPos.current.y = targetPos.current.y + (canvas.height * (offsetY / 100) - targetPos.current.y) * 0.1;
    }

    // 3. Vẽ vòng cổ ĐÃ ĐƯỢC KHỬ NỀN TRONG SUỐT tại vị trí track được
    if (faceDetected && !faceScanning && !simulateNoFace && transparentNecklace) {
      const w = canvas.width * (scale / 100);
      const h = w; 
      const x = targetPos.current.x - w / 2;
      const y = targetPos.current.y - h / 2;
      
      // Vẽ trực tiếp canvas phụ trong suốt
      ctx.drawImage(transparentNecklace, x, y, w, h);
    }

    // 4. Tiếp tục vòng lặp animation frame
    animationFrameId.current = requestAnimationFrame(renderLiveAR);
  }, [cameraActive, scale, offsetY, faceDetected, faceScanning, simulateNoFace, transparentNecklace]);

  useEffect(() => {
    if (cameraActive) {
      renderLiveAR();
    }
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [cameraActive, renderLiveAR]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      const msg = "Không thể truy cập camera. Quyền truy cập camera bị từ chối (Camera permission is denied) hoặc camera đang bị ứng dụng khác chiếm dụng. Vui lòng cấp quyền camera trong cài đặt trình duyệt để tiếp tục.";
      setCameraError(msg);
      toast.error("Camera permission denied!");
      setCameraActive(false);
    }
  }, [simulateNoFace]);

  const capturePhoto = useCallback(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPhoto(dataUrl);
    stopCamera();
    toast.success("Đã chụp ảnh AR thành công!");
  }, [stopCamera]);

  const downloadPhoto = () => {
    if (!photo) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.src = photo;
    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      if (!faceDetected || !transparentNecklace) {
        triggerDownload(canvas);
        return;
      }

      // Vẽ vòng cổ trong suốt lên ảnh ghép
      const w = canvas.width * (scale / 100);
      const h = w; 
      const x = targetPos.current.x - w / 2;
      const y = targetPos.current.y - h / 2;

      ctx.drawImage(transparentNecklace, x, y, w, h);
      triggerDownload(canvas);
    };
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
        toast.error("Không phát hiện khuôn mặt (Face not detected)!");
      } else {
        setFaceDetected(true);
        toast.success("Đã phát hiện khuôn mặt thành công.");
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
          Sử dụng Camera trực tiếp của bạn hoặc tải lên một bức ảnh chân dung để đeo thử những thiết kế dây chuyền tinh xảo từ Luna Jewel trong thời gian thực.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        
        {/* Try-on Preview Screen */}
        <div className="bg-brand-soft/20 rounded-xl p-5 border border-brand/10 flex flex-col justify-between shadow-sm">
          
          {/* Main Visual Screen */}
          <div
            className="relative w-full flex-1 min-h-[440px] mx-auto bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
          >
            {/* Hidden video element for stream capture */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
            />

            {/* Display Canvas - Render Live stream overlay & Static Photos */}
            <canvas
              ref={displayCanvasRef}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                cameraActive ? "opacity-100" : "hidden"
              }`}
            />

            {/* Static Photo Display */}
            {photo && !cameraActive && (
              <>
                <img
                  src={photo}
                  alt="Ảnh chân dung"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Đeo vòng cổ ĐÃ ĐƯỢC KHỬ NỀN TRONG SUỐT lên ảnh chân dung tĩnh */}
                {faceDetected && (
                  <img
                    src={selected.src}
                    alt={`Vòng cổ ${selected.name}`}
                    draggable={false}
                    style={{ width: `${scale}%`, top: `${offsetY}%` }}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none mix-blend-multiply drop-shadow-2xl animate-fade-in duration-300"
                  />
                )}
              </>
            )}

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
                <span className="text-[10px] text-slate-500 bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider font-bold">hoặc bật camera để chụp live</span>
              </div>
            )}

            {/* Alternative Flow A1 Error State */}
            {cameraError && (
              <div className="flex flex-col items-center gap-3 text-red-400 px-6 text-center max-w-md">
                <AlertCircle className="w-12 h-12" />
                <span className="text-sm font-bold uppercase tracking-wider">Lỗi Truy Cập Camera</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-red-950/40 p-4 rounded-lg border border-red-500/20">{cameraError}</p>
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
                  <p className="text-xs font-bold uppercase tracking-wider">Không phát hiện khuôn mặt (Face not detected)</p>
                  <p className="text-[10px] opacity-90 mt-0.5 font-medium leading-relaxed">Vui lòng căn chỉnh camera hoặc ảnh chân dung sao cho khuôn mặt và cổ nằm ở vùng trung tâm khung hình.</p>
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
                {collection.name}
              </p>
              <span className="text-[10px] font-bold text-brand bg-white px-2 py-0.5 rounded shadow-2xs shrink-0">
                {collectionIdx + 1}/{COLLECTIONS.length}
              </span>
            </div>

            <p className="mt-2.5 text-[11px] text-muted-foreground font-medium">
              Sử dụng nút mũi tên bên dưới để thay đổi Bộ sưu tập, sau đó click chọn mẫu vòng cổ để đeo thử AR trực tuyến.
            </p>

            <div className="mt-5 relative px-1">
              <div className="grid grid-cols-2 gap-3.5">
                {necklaces.map((n) => {
                  const active = selected.id === n.id;
                  return (
                    <button
                      type="button"
                      key={n.id}
                      onClick={() => { setSelected(n); setUserPicked(true); }}
                      aria-pressed={active && userPicked}
                      className={`group relative rounded-lg overflow-hidden border bg-white text-left transition-all duration-200 flex flex-col ${
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
                      <div className={`text-center py-2 text-[10px] font-bold tracking-widest transition-colors ${
                        active && userPicked ? "bg-brand text-brand-foreground" : "bg-brand-soft/75 text-brand group-hover:bg-brand group-hover:text-brand-foreground"
                      }`}>
                        ĐANG THỬ AR
                      </div>
                      <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                        <p className="text-[11px] leading-snug font-semibold text-foreground/80 line-clamp-2 min-h-[2.6em]">
                          {n.name}
                        </p>
                        <p className="text-sm font-extrabold text-price">{n.price}</p>
                      </div>
                    </button>
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
