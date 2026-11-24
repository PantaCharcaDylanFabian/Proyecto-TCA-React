import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const SUPPORTED_FORMATS: Html5QrcodeSupportedFormats[] = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.UPC_A,
];

export function CameraScanner({ onCode }: { onCode: (code: string) => void }) {
  const rawId = useId();
  const containerId = `tca-camera-scanner-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lockedRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch {
        // Ignora errores si la cámara ya estaba detenida al desmontar
      }
    }
    setRunning(false);
  };

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador o contexto (usa localhost o HTTPS) no permite acceder a la cámara. Usa un lector USB/Bluetooth o escribe el código.');
      return;
    }

    try {
      await stopScanner();
      lockedRef.current = false;

      const scanner = new Html5Qrcode(containerId, {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });
      scannerRef.current = scanner;
      setRunning(true);

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 140 } },
        (decodedText) => {
          if (lockedRef.current) return;
          lockedRef.current = true;
          void stopScanner().then(() => {
            onCode(decodedText);
          });
        },
        () => {
          // Fotograma sin código detectado; continúa escaneando
        }
      );
    } catch {
      await stopScanner();
      setError('No se pudo abrir la cámara. Revisa el permiso del navegador o utiliza el lector y la búsqueda manual.');
    }
  };

  return (
    <div className="no-print">
      <button
        type="button"
        className="tca-button secondary"
        onClick={() => {
          if (running) {
            void stopScanner();
          } else {
            void startScanner();
          }
        }}
      >
        {running ? 'Detener cámara' : 'Escanear con cámara'}
      </button>

      <div
        id={containerId}
        hidden={!running}
        className="w-full max-w-sm rounded-lg overflow-hidden mt-3"
        aria-label="Vista de cámara para escanear"
      />

      {error && (
        <p role="status" className="tca-warning">
          {error}
        </p>
      )}
    </div>
  );
}