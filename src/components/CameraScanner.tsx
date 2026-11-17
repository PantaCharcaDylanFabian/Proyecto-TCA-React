import { useEffect, useRef, useState } from 'react';

interface Detector { detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>; }
interface DetectorConstructor { new(options: { formats: string[] }): Detector; getSupportedFormats: () => Promise<string[]>; }

export function CameraScanner({ onCode }: { onCode: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const state = useRef<{ stream?: MediaStream; timer?: number; active: boolean }>({ active: false });
  const [running, setRunning] = useState(false); const [error, setError] = useState('');
  const release = () => { state.current.active = false; window.clearTimeout(state.current.timer); state.current.stream?.getTracks().forEach(track => track.stop()); };
  useEffect(() => () => { release(); }, []);
  const start = async () => {
    setError('');
    const Constructor = (window as unknown as { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;
    if (!Constructor || !navigator.mediaDevices?.getUserMedia) { setError('Este navegador no permite escanear con cámara. Usa un lector USB/Bluetooth o escribe el código.'); return; }
    try {
      const formats = await Constructor.getSupportedFormats();
      const detector = new Constructor({ formats: formats.filter(f => ['ean_13','ean_8','code_128','code_39','qr_code','upc_a'].includes(f)) });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      if (!video.current) { stream.getTracks().forEach(track => track.stop()); return; }
      state.current.stream = stream; state.current.active = true; video.current.srcObject = stream;
      setRunning(true); await video.current.play();
      const scan = async () => {
        if (!state.current.active || !video.current) return;
        try {
          const found = await detector.detect(video.current);
          if (state.current.active && found[0]?.rawValue) { onCode(found[0].rawValue); release(); setRunning(false); return; }
        } catch { /* A frame may not be ready; the next frame is retried. */ }
        if (state.current.active) state.current.timer = window.setTimeout(() => { void scan(); }, 250);
      };
      void scan();
    } catch { release(); setRunning(false); setError('No se pudo abrir la cámara. Revisa el permiso del navegador o utiliza el lector y la búsqueda manual.'); }
  };
  return <div className="no-print"><button type="button" className="tca-button secondary" onClick={() => { if (running) { release(); setRunning(false); } else void start(); }}>{running ? 'Detener cámara' : 'Escanear con cámara'}</button>
    <video ref={video} hidden={!running} autoPlay playsInline muted className="w-full max-w-sm rounded-lg mt-3" aria-label="Vista de cámara para escanear" />
    {error && <p role="status" className="tca-warning">{error}</p>}
  </div>;
}
