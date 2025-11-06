
import React, { useEffect, useRef } from 'react';
import { Item } from '../types';
import { XIcon, PrintIcon } from './icons';

// Cannot import from library, so define a simple wrapper
const QRCode: React.FC<{ value: string; size: number }> = ({ value, size }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        // Mock QR code generation by drawing a simple pattern
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear canvas
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, size, size);

                ctx.fillStyle = 'black';
                // Simple representation of a QR code
                const qrSize = Math.floor(size / 21); // QR codes have versions, 21x21 is v1
                for (let y = 0; y < 21; y++) {
                    for (let x = 0; x < 21; x++) {
                        if (Math.random() > 0.5) {
                            ctx.fillRect(x * qrSize, y * qrSize, qrSize, qrSize);
                        }
                    }
                }
                 // Add alignment patterns and finder patterns for more realism
                const drawFinder = (x: number, y: number) => {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(x*qrSize, y*qrSize, qrSize*7, qrSize);
                    ctx.fillRect(x*qrSize, (y+6)*qrSize, qrSize*7, qrSize);
                    ctx.fillRect(x*qrSize, y*qrSize, qrSize, qrSize*7);
                    ctx.fillRect((x+6)*qrSize, y*qrSize, qrSize, qrSize*7);
                    ctx.fillStyle = 'white';
                    ctx.fillRect((x+1)*qrSize, (y+1)*qrSize, qrSize*5, qrSize*5);
                    ctx.fillStyle = 'black';
                    ctx.fillRect((x+2)*qrSize, (y+2)*qrSize, qrSize*3, qrSize*3);
                };
                drawFinder(0,0);
                drawFinder(14,0);
                drawFinder(0,14);
            }
        }
    }, [value, size]);

    return <canvas ref={canvasRef} width={size} height={size} />;
};


interface QRCodeGeneratorProps {
  item: Item;
  locationName: string;
  onClose: () => void;
}

// FIX: Define a type for the component that includes the static QRCodeDisplay property
// to resolve TypeScript errors in this file and where it's imported (ItemDetail.tsx).
interface QRCodeGeneratorComponent extends React.FC<QRCodeGeneratorProps> {
  QRCodeDisplay: typeof QRCode;
}

const QRCodeGenerator: QRCodeGeneratorComponent = ({ item, locationName, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      const printHtml = printContent.innerHTML;
      
      document.body.innerHTML = `
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                @page { 
                  size: 100mm 50mm; 
                  margin: 0;
                }
                .label-container {
                  width: 100mm;
                  height: 50mm;
                  padding: 4mm;
                  display: flex;
                  align-items: center;
                  box-sizing: border-box;
                  font-family: sans-serif;
                  border: 1px solid black;
                  page-break-after: always;
                }
                .qr-code {
                   flex-shrink: 0;
                   width: 40mm;
                   height: 40mm;
                }
                .item-details {
                  padding-left: 4mm;
                  overflow: hidden;
                }
                .item-details h3 {
                  font-size: 14pt;
                  font-weight: bold;
                  margin: 0 0 2mm 0;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }
                .item-details p {
                  font-size: 10pt;
                  margin: 0 0 1mm 0;
                }
              }
            </style>
          </head>
          <body>${printHtml}</body>
        </html>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      // This is a simple reload to restore event listeners, etc.
      window.location.reload(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Print QR Code</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XIcon />
          </button>
        </div>
        
        <div ref={printRef}>
            <div className="label-container flex items-center p-4 border dark:border-gray-600 rounded-lg">
                <div className="qr-code flex-shrink-0">
                     <QRCode value={item.sku} size={150} />
                </div>
                <div className="item-details ml-4 overflow-hidden">
                    <h3 className="font-bold text-lg truncate" title={item.name}>{item.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cat: {item.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loc: {locationName}</p>
                </div>
            </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            <PrintIcon />
            Print Label
          </button>
        </div>
      </div>
    </div>
  );
};

QRCodeGenerator.QRCodeDisplay = QRCode;

export default QRCodeGenerator;