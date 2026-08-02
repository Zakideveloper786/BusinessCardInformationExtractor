import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Link2, Image as ImageIcon, Cpu, X, FileImage, Camera } from 'lucide-react';

const UploadCard = ({
  file,
  setFile,
  url,
  setUrl,
  activeTab,
  setActiveTab,
  onExtract,
  isLoading,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Camera States
  const [cameraError, setCameraError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mobileCameraInputRef = useRef(null);

  const triggerMobileCamera = () => {
    if (mobileCameraInputRef.current) {
      mobileCameraInputRef.current.click();
    }
  };

  // Stop camera stream helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start camera stream helper
  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      if (streamRef.current) {
        stopCamera();
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Live camera stream requires HTTPS when accessing over mobile network IP. Please tap 'Open Phone Camera App' below.");
      }
      const constraints = {
        video: { facingMode: 'environment' },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      const errMsg = (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia)
        ? "Live camera stream requires HTTPS when accessing over local network IP. Please tap 'Open Phone Camera App' below."
        : "Could not access live stream camera. Please check camera permissions or use the phone camera app below.";
      setCameraError(errMsg);
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Manage camera lifecycle
  useEffect(() => {
    if (activeTab === 'camera' && !file) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, file]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || video.clientWidth || 1280;
    const height = video.videoHeight || video.clientHeight || 720;

    if (width === 0 || height === 0) {
      console.warn("Video stream dimensions not ready yet");
      return;
    }

    // Create canvas matching video aspect ratio and size
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw the current video frame
      ctx.drawImage(video, 0, 0, width, height);

      // Convert to blob and save as high-quality JPEG
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a File object so it behaves exactly like an uploaded file
          const capturedFile = new File([blob], `captured_card_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFile(capturedFile);
          setUrl(''); // Clear URL if image captured
        }
      }, 'image/jpeg', 0.95);
    }
  };

  // File drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setUrl(''); // Clear URL if image uploaded
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl(''); // Clear URL if image uploaded
    }
  };

  const triggerBrowse = () => {
    if (isLoading) return;
    fileInputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setFile(null); // Clear File if URL entered
  };

  // Check if we have valid input to extract
  const hasInput = ((activeTab === 'upload' || activeTab === 'camera') && file !== null) || (activeTab === 'url' && url.trim() !== '');

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      {/* Input Glass Card */}
      <div className="glass-panel p-6 flex flex-col gap-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <UploadCloud className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold tracking-wide">Upload Business Card</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 gap-1 overflow-x-auto">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => !isLoading && setActiveTab('upload')}
            disabled={isLoading}
          >
            <ImageIcon className="w-4 h-4" />
            Upload Image
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'camera' ? 'active' : ''}`}
            onClick={() => !isLoading && setActiveTab('camera')}
            disabled={isLoading}
          >
            <Camera className="w-4 h-4" />
            Capture Image
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => !isLoading && setActiveTab('url')}
            disabled={isLoading}
          >
            <Link2 className="w-4 h-4" />
            Image URL
          </button>
        </div>

        {/* Option 1: Upload Drag & Drop / File Input */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            {!file ? (
              <div
                className={`dropzone ${isDragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerBrowse}
              >
                <div className="flex flex-col items-center gap-2 py-4">
                  <UploadCloud className="w-12 h-12 text-blue-500 mb-2" />
                  <p className="text-sm text-slate-300">
                    Drag & drop your business card here, or{' '}
                    <span className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">Supports PNG, JPG, JPEG (Max 8MB)</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/20 flex justify-center items-center p-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Business Card Preview"
                  className="w-full max-h-64 object-contain rounded-lg shadow-md animate-fade-in"
                />
                {!isLoading && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white border border-white/10 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Option 3: Camera Capture */}
        {activeTab === 'camera' && (
          <div className="flex flex-col gap-4">
            <input
              ref={mobileCameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            {!file ? (
              <div className="flex flex-col gap-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 flex flex-col justify-center items-center aspect-[4/3] w-full min-h-[280px]">
                  {isCameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 z-10 text-slate-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="text-sm">Starting camera...</span>
                    </div>
                  )}
                  {cameraError ? (
                    <div className="flex flex-col items-center justify-center gap-4 p-6 text-center text-slate-300">
                      <Camera className="w-12 h-12 text-blue-500/80" />
                      <p className="text-xs leading-relaxed text-slate-400 max-w-xs">{cameraError}</p>
                      <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-center">
                        <button
                          type="button"
                          onClick={triggerMobileCamera}
                          className="px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Open Phone Camera App
                        </button>

                      </div>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay frame */}
                      <div className="absolute inset-4 border border-dashed border-white/30 rounded-lg pointer-events-none flex items-center justify-center">
                        <span className="text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded">Position card inside frame</span>
                      </div>
                      {/* Capture button */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          disabled={isCameraLoading}
                          className="p-3 bg-white hover:bg-slate-100 text-slate-900 rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 border border-slate-300"
                        >
                          <Camera className="w-5 h-5 text-blue-600" />
                          <span className="text-xs font-bold uppercase tracking-wider pr-1">Capture Photo</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Additional Mobile Direct Trigger Button underneath stream */}
                {!cameraError && (
                  <button
                    type="button"
                    onClick={triggerMobileCamera}
                    className="w-full py-2.5 text-xs text-slate-400 hover:text-blue-400 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Or open phone's built-in camera app directly
                  </button>
                )}
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/20 flex justify-center items-center p-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Business Card Preview"
                  className="w-full max-h-64 object-contain rounded-lg shadow-md animate-fade-in"
                />
                {!isLoading && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white border border-white/10 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Option 2: Image URL Input */}
        {activeTab === 'url' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="imageUrl" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Paste Image URL
              </label>
              <div className="relative flex items-center">
                <Link2 className="absolute left-3.5 w-5 h-5 text-slate-500" />
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/businesscard.jpg"
                  value={url}
                  onChange={handleUrlChange}
                  disabled={isLoading}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* URL Image Preview */}
            {url.trim() && url.startsWith('http') && (
              <div className="rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/20 max-h-48 flex justify-center items-center p-2">
                <img
                  src={url}
                  alt="Business Card Preview"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block';
                  }}
                  className="max-h-44 object-contain rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onExtract}
        disabled={!hasInput || isLoading}
        className="primary-btn w-full py-4 text-base"
      >
        <Cpu className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
        {isLoading ? 'Processing...' : 'Extract Information'}
      </button>
    </div>
  );
};

export default UploadCard;
