import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicUrl: string;
  salonNom: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  publicUrl,
  salonNom,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (isOpen && publicUrl) {
      QRCode.toDataURL(publicUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#111111', // Foreground
          light: '#ffffff',
        },
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('Erreur génération QR code', err));
    }
  }, [isOpen, publicUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    success('Lien copié dans le presse-papiers !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qrcode-reservation-${salonNom.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('QR Code téléchargé avec succès');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="relative w-full max-w-md bg-surface rounded-[18px] shadow-hard-lg p-6 sm:p-7 border-2 border-border">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold font-display text-foreground">
              QR Code de réservation
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Imprimez-le pour votre vitrine ou votre comptoir
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-alt transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code preview */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="p-4 bg-white rounded-[20px] shadow-hard-sm border-2 border-border">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code réservation ${salonNom}`}
                className="w-52 h-52 object-contain"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-muted-foreground">
                Génération...
              </div>
            )}
          </div>
          <p className="text-xs font-semibold text-primary mt-3 text-center">
            {salonNom}
          </p>
          <span className="text-[11px] text-muted-foreground text-center font-mono mt-0.5 truncate max-w-xs">
            {publicUrl}
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full press bg-primary text-white border-2 border-ink text-xs sm:text-sm font-semibold shadow-hard-md transition-all min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'image PNG (haute qualité)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-surface-alt hover:bg-lime text-foreground text-xs font-semibold border-2 border-border transition-colors min-h-[44px] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-surface-alt hover:bg-lime text-foreground text-xs font-semibold border-2 border-border transition-colors min-h-[44px] cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tester le lien</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
