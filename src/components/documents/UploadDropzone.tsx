import React, { useRef, useState } from 'react';
import { UploadIcon } from '@radix-ui/react-icons';
import { colors, radii, spacing } from '../../theme/tokens';
import GumroadHeading from '../design-system/GumroadHeading';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFileSelected, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFileSelected(files[0]);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      style={{
        border: `3px dashed ${colors.ink}`,
        borderRadius: radii.lg,
        padding: spacing.xl,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: dragging ? colors['surface-cream'] : 'transparent',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.15s ease',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*,video/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />
      <UploadIcon width={32} height={32} style={{ marginBottom: '8px' }} />
      <GumroadHeading level="title-sm" as="h3">
        Arraste um arquivo aqui ou clique para escolher
      </GumroadHeading>
      <p style={{ fontSize: '13px', opacity: 0.6, marginTop: '4px' }}>PDF, imagem ou vídeo</p>
    </div>
  );
};

export default UploadDropzone;
