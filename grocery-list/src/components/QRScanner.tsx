import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QRScannerProps } from '../types';

export default function QRScanner({ onScan, onError, width = 300, height = 300 }: QRScannerProps): React.ReactElement {
  const qrRef = useRef<HTMLDivElement>(null);
  const html5Qr = useRef<Html5Qrcode | null>(null);
  const started = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!qrRef.current) return;

    html5Qr.current = new Html5Qrcode(qrRef.current.id);

    Html5Qrcode.getCameras().then(cameras => {
      if (!isMounted || !html5Qr.current) return;
      if (cameras && cameras.length) {
        html5Qr.current.start(
          cameras[0].id,
          { fps: 10, qrbox: { width, height } },
          (decodedText: string) => {
            onScan(decodedText);
            if (started.current && html5Qr.current) {
              html5Qr.current.stop().catch(() => {});
              started.current = false;
            }
          },
          (error: string) => onError(error)
        ).then(() => {
          started.current = true;
        }).catch((err: any) => {
          onError(err.toString());
          started.current = false;
        });
      } else {
        onError('No camera found');
      }
    }).catch((err: any) => onError(err.toString()));
    
    return () => {
      isMounted = false;
      if (html5Qr.current) {
        if (started.current) {
          html5Qr.current.stop()
            .catch(() => {})
            .then(() => {
              if (html5Qr.current) {
                html5Qr.current.clear();
              }
              started.current = false;
            });
        } else {
          html5Qr.current.clear();
        }
      }
    };
  }, [onScan, onError, width, height]);

  return (
    <div>
      <div id="qr-reader" ref={qrRef} style={{ width, height }} />
    </div>
  );
}
