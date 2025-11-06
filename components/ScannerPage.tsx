import React, { useState, useEffect, useRef } from 'react';
import { TransactionType } from '../types';
import { RefreshIcon } from './icons';
import { Html5Qrcode } from 'html5-qrcode';

interface ScannerPageProps {
  onStockUpdate: (sku: string, quantityChange: number, type: TransactionType) => boolean;
  onNavigateToDetail: (sku: string) => void;
}

enum ScanMode {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound',
  LOOKUP = 'Lookup'
}

const ScannerPage: React.FC<ScannerPageProps> = ({ onStockUpdate, onNavigateToDetail }) => {
  const [scanMode, setScanMode] = useState<ScanMode>(ScanMode.LOOKUP);
  const [scannedSku, setScannedSku] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const scannerRef = useRef<any>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Effect to initialize scanner and get cameras
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        if (readerRef.current) {
          const html5QrCode = new Html5Qrcode(readerRef.current.id, /* verbose= */ false);
          scannerRef.current = html5QrCode;

          // Request camera permission first
          try {
            await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          } catch (permError) {
            console.warn('Camera permission request failed or denied:', permError);
          }

          // Then get available cameras
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length) {
            setCameras(devices);
            const rearCamera = devices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('rear')
            );
            setSelectedCameraId(rearCamera ? rearCamera.id : devices[0].id);
            setCameraError(null);
          } else {
            setCameraError('No cameras found on this device.');
          }
        }
      } catch (error: any) {
        console.error('Scanner initialization error:', error);
        setCameraError('Cannot access camera. Please grant permission and refresh the page.');
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        stopScanner();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to start scanner when camera ID is selected
  useEffect(() => {
    if (selectedCameraId && !scannedSku) {
      startScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCameraId]);


  const startScanner = () => {
    if (scannerRef.current && selectedCameraId && !scannerRef.current.isScanning) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      scannerRef.current.start(
          selectedCameraId,
          config,
          (decodedText: string) => handleScanSuccess(decodedText),
          (errorMessage: string) => { /* ignore */ }
      )
      .then(() => {
        setCameraError(null);
        setMessage(null);
      })
      .catch((err: any) => {
        console.error(`Failed to start scanner with camera ${selectedCameraId}`, err);
        setCameraError('Failed to start the selected camera. It might be in use or permissions are denied.');
      });
    }
  };
  
  const stopScanner = (): Promise<void> => {
    if (scannerRef.current?.isScanning) {
      return scannerRef.current.stop()
        .catch((err: any) => console.error("Failed to stop scanner", err));
    }
    return Promise.resolve();
  };
  
  const handleScanSuccess = (decodedText: string) => {
    stopScanner().then(() => {
        setScannedSku(decodedText);
        if (scanMode === ScanMode.LOOKUP) {
            onNavigateToDetail(decodedText);
            // Component will likely unmount, but if not, reset will prepare for next scan
            setTimeout(() => resetScannerState(), 100);
        }
    });
  };

  const handleSubmit = () => {
    if (!scannedSku) return;

    const quantityChange = scanMode === ScanMode.INBOUND ? quantity : -quantity;
    const success = onStockUpdate(scannedSku, quantityChange, scanMode as unknown as TransactionType);
    
    if(success) {
        setMessage({ text: `Successfully updated stock for SKU ${scannedSku}. Quantity: ${quantityChange}`, type: 'success' });
    } else {
        setMessage({ text: `Failed to find item with SKU: ${scannedSku}`, type: 'error' });
    }
    
    resetScannerState();
  };
  
  const resetScannerState = () => {
      setScannedSku(null);
      setQuantity(1);
      setTimeout(() => setMessage(null), 5000);
      startScanner();
  };

  const handleCameraChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = event.target.value;
    await stopScanner();
    setSelectedCameraId(newCameraId);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-center">QR Code Scanner</h1>
      
      {cameras.length > 1 && (
        <div className="flex flex-col items-center">
          <label htmlFor="camera-select" className="text-sm font-medium mb-1 dark:text-gray-300">Select Camera:</label>
          <select 
              id="camera-select"
              value={selectedCameraId} 
              onChange={handleCameraChange}
              className="w-full max-w-xs p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
          >
              {cameras.map(camera => (
                  <option key={camera.id} value={camera.id}>{camera.label || `Camera ${camera.id}`}</option>
              ))}
          </select>
        </div>
      )}

      <div id="qr-reader" ref={readerRef} className="w-full border-4 border-dashed dark:border-gray-600 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
        {cameraError && (
          <div className="text-center p-4 text-red-500 space-y-3">
              <p className="font-semibold">Camera Error</p>
              <p>{cameraError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Refresh Page
              </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
        {(Object.values(ScanMode)).map(mode => (
          <button
            key={mode}
            onClick={() => setScanMode(mode)}
            className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${scanMode === mode ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
          >
            {mode}
          </button>
        ))}
      </div>
      
      {scannedSku && scanMode !== ScanMode.LOOKUP && (
        <div className="p-4 border dark:border-gray-600 rounded-lg space-y-4 bg-gray-50 dark:bg-gray-700">
          <p className="font-semibold text-center">Scanned SKU: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{scannedSku}</span></p>
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="font-medium">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2 border dark:border-gray-500 rounded-md bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-4">
            <button onClick={resetScannerState} className="w-full flex items-center justify-center gap-2 bg-gray-500 text-white p-3 rounded-lg font-semibold hover:bg-gray-600">
              <RefreshIcon/>
              Scan Again
            </button>
            <button onClick={handleSubmit} className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700">
              Confirm {scanMode}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
