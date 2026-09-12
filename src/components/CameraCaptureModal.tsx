import React, { useEffect, useRef, useState } from 'react';
import { Camera, FlipHorizontal, RefreshCw, X, Check, AlertCircle, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  // Initialize camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setErrorMsg(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsStarting(true);
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStarting(false);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsStarting(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission denied. Please allow camera permissions in your browser or upload an image file directly.');
      } else {
        setErrorMsg('Unable to access webcam. You can upload a photo from your device instead.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileUploadFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onCapture(result);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div 
        id="camera-modal-container"
        className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-900/90 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm">FoodFresh Camera Scanner</h3>
          </div>
          <button
            id="close-camera-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            // Captured preview
            <img
              src={capturedImage}
              alt="Captured food"
              className="w-full h-full object-contain"
            />
          ) : errorMsg ? (
            // Error fallback
            <div className="p-6 text-center text-stone-300 max-w-sm">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <p className="text-sm mb-4">{errorMsg}</p>
              <label
                id="camera-upload-fallback-btn"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl cursor-pointer shadow-md transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Food Photo Instead
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadFallback}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            // Live video stream
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="w-4/5 h-4/5 border-2 border-dashed border-emerald-400/60 rounded-2xl flex items-center justify-center">
                  <span className="text-xs text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
                    Frame food product here
                  </span>
                </div>
              </div>

              {isStarting && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-900/80 text-white gap-2 text-sm">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  Initializing camera...
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          {capturedImage ? (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                id="retake-camera-photo-btn"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                id="confirm-camera-photo-btn"
                onClick={handleConfirmPhoto}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <Check className="w-4 h-4" />
                Use This Image
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              {/* Flip camera */}
              <button
                id="flip-camera-facing-btn"
                onClick={handleSwitchCamera}
                disabled={Boolean(errorMsg)}
                className="p-3 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 disabled:opacity-30 transition-colors"
                title="Switch Camera Facing"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>

              {/* Shutter capture button */}
              <button
                id="shutter-capture-btn"
                onClick={handleTakePhoto}
                disabled={Boolean(errorMsg) || isStarting}
                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-40 transition-all shadow-lg shadow-emerald-950"
                title="Capture Photo"
              >
                <div className="w-12 h-12 rounded-full bg-white/90"></div>
              </button>

              {/* Fallback upload button */}
              <label
                id="upload-alt-file-btn"
                className="p-3 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 cursor-pointer transition-colors"
                title="Upload image file instead"
              >
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadFallback}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
