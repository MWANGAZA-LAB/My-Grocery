import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onError, width = 300, height = 300 }) {
  const qrRef = useRef();
  const html5Qr = useRef();
  const started = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (!qrRef.current) return;

    html5Qr.current = new Html5Qrcode(qrRef.current.id);

    Html5Qrcode.getCameras().then(cameras => {
      if (!isMounted) return;
      if (cameras && cameras.length) {
        html5Qr.current.start(
          cameras[0].id,
          { fps: 10, qrbox: { width, height } },
          decodedText => {
            onScan(decodedText);
            if (started.current) {
              html5Qr.current.stop().catch(() => {});
              started.current = false;
            }
          },
          onError
        ).then(() => {
          started.current = true;
        }).catch(err => {
          onError(err);
          started.current = false;
        });
      } else {
        onError('No camera found');
      }
    }).catch(err => onError(err));
    return () => {
      isMounted = false;
      if (html5Qr.current) {
        if (started.current) {
          html5Qr.current.stop()
            .catch(() => {})
            .then(() => {
              html5Qr.current.clear();
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