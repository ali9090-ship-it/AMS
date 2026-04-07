import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Check } from "lucide-react";

interface ImageCropperProps {
  imageFile: File;
  onCropped: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

const CROP_SIZE = 256; // output size in px

export default function ImageCropper({ imageFile, onCropped, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  // Load image once
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgLoaded(true);
      // Center the image initially
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    img.src = URL.createObjectURL(imageFile);
    return () => URL.revokeObjectURL(img.src);
  }, [imageFile]);

  // Render preview
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displaySize = 300; // preview area size
    canvas.width = displaySize;
    canvas.height = displaySize;

    ctx.clearRect(0, 0, displaySize, displaySize);

    // Draw dark background
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, displaySize, displaySize);

    // Calculate scale to fit the shorter side of the image to the display area
    const imgAspect = img.width / img.height;
    let baseScale: number;
    if (imgAspect > 1) {
      baseScale = displaySize / img.height;
    } else {
      baseScale = displaySize / img.width;
    }

    const totalScale = baseScale * zoom;

    ctx.save();
    ctx.translate(displaySize / 2, displaySize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(offset.x, offset.y);
    ctx.drawImage(
      img,
      (-img.width * totalScale) / 2,
      (-img.height * totalScale) / 2,
      img.width * totalScale,
      img.height * totalScale
    );
    ctx.restore();

    // Draw circular mask overlay
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, displaySize, displaySize);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2 - 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw circle border
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2 - 16, 0, Math.PI * 2);
    ctx.stroke();

    // Draw crosshair guides
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(displaySize / 2, 16);
    ctx.lineTo(displaySize / 2, displaySize - 16);
    ctx.moveTo(16, displaySize / 2);
    ctx.lineTo(displaySize - 16, displaySize / 2);
    ctx.stroke();
    ctx.restore();
  }, [zoom, rotation, offset]);

  useEffect(() => {
    if (imgLoaded) renderPreview();
  }, [imgLoaded, renderPreview]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.3, Math.min(5, z - e.deltaY * 0.002)));
  };

  // Crop and return blob
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = CROP_SIZE;
    outputCanvas.height = CROP_SIZE;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    const displaySize = 300;
    const cropRadius = displaySize / 2 - 16;

    // Clip to circle
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const scaleRatio = CROP_SIZE / (cropRadius * 2);

    const imgAspect = img.width / img.height;
    let baseScale: number;
    if (imgAspect > 1) {
      baseScale = displaySize / img.height;
    } else {
      baseScale = displaySize / img.width;
    }
    const totalScale = baseScale * zoom * scaleRatio;

    ctx.save();
    ctx.translate(CROP_SIZE / 2, CROP_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(offset.x * scaleRatio, offset.y * scaleRatio);
    ctx.drawImage(
      img,
      (-img.width * totalScale) / 2,
      (-img.height * totalScale) / 2,
      img.width * totalScale,
      img.height * totalScale
    );
    ctx.restore();

    outputCanvas.toBlob(
      (blob) => {
        if (blob) onCropped(blob);
      },
      "image/png",
      1
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-[380px] rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Adjust Profile Photo</h3>
          <button
            onClick={onCancel}
            className="rounded-full p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-400">
          Drag to reposition • Scroll or use slider to zoom
        </p>

        {/* Canvas preview area */}
        <div
          ref={containerRef}
          className="mx-auto mb-5 overflow-hidden rounded-xl"
          style={{ width: 300, height: 300, cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        {/* Controls */}
        <div className="mb-5 space-y-3">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range"
              min="0.3"
              max="5"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-blue-500 h-1.5 rounded-full appearance-none bg-gray-700
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                         [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(59,130,246,0.5)]
                         [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <button
              onClick={() => setZoom((z) => Math.min(5, z + 0.15))}
              className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Rotate button */}
          <div className="flex justify-center">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              Rotate 90°
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-600 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-colors"
          >
            <Check className="h-4 w-4" />
            Apply Photo
          </button>
        </div>
      </div>
    </div>
  );
}
