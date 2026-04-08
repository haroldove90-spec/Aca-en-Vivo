import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("No se pudo acceder a la cámara");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        onCapture(dataUrl);
        stopCamera();
        onClose();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { stopCamera(); onClose(); }}
          className="fixed inset-0 z-[300] bg-dark/90 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-none overflow-hidden max-w-2xl w-full shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative"
          >
            {!showCamera ? (
              <div className="p-6 lg:p-12 text-center space-y-6 lg:space-y-8">
                <div className="w-16 h-16 lg:w-24 lg:h-24 bg-primary/10 rounded-none flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8 lg:w-12 lg:h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter">Capturar Imagen</h3>
                  <p className="text-[8px] lg:text-xs font-bold text-muted uppercase tracking-widest">Elige cómo quieres subir tu fotografía</p>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <button 
                    onClick={startCamera}
                    className="flex flex-col items-center gap-3 lg:gap-4 p-4 lg:p-8 bg-gray-50 hover:bg-primary/5 border border-gray-100 rounded-none transition-all group"
                  >
                    <Camera className="w-6 h-6 lg:w-8 lg:h-8 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">Usar Cámara</span>
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 lg:gap-4 p-4 lg:p-8 bg-gray-50 hover:bg-primary/5 border border-gray-100 rounded-none transition-all group"
                  >
                    <Upload className="w-6 h-6 lg:w-8 lg:h-8 text-navy group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">Subir Archivo</span>
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="aspect-video bg-black relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                
                <div className="p-4 lg:p-8 flex justify-center gap-4 lg:gap-6 bg-white">
                  <button 
                    onClick={stopCamera}
                    className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 text-muted rounded-none flex items-center justify-center hover:bg-gray-200 transition-all"
                  >
                    <X className="w-6 h-6 lg:w-8 lg:h-8" />
                  </button>
                  <button 
                    onClick={takePhoto}
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-primary text-white rounded-none flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-all"
                  >
                    <div className="w-12 h-12 lg:w-16 lg:h-16 border-2 lg:border-4 border-white/30 rounded-none flex items-center justify-center">
                      <div className="w-8 h-8 lg:w-12 lg:h-12 bg-white rounded-none" />
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => { stopCamera(); onClose(); }}
              className="absolute top-4 right-4 lg:top-6 lg:right-6 w-8 h-8 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center text-white border border-white/30 hover:bg-white/40 transition-all"
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
