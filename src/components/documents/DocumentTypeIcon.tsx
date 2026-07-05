import React from 'react';
import { FileTextIcon, ImageIcon, VideoIcon, FileIcon } from '@radix-ui/react-icons';
import { getDocumentKind } from '../../types/documents';

interface DocumentTypeIconProps {
  mimeType: string;
  size?: number;
}

const DocumentTypeIcon: React.FC<DocumentTypeIconProps> = ({ mimeType, size = 28 }) => {
  const kind = getDocumentKind(mimeType);
  const props = { width: size, height: size };
  switch (kind) {
    case 'pdf':
      return <FileTextIcon {...props} />;
    case 'image':
      return <ImageIcon {...props} />;
    case 'video':
      return <VideoIcon {...props} />;
    default:
      return <FileIcon {...props} />;
  }
};

export default DocumentTypeIcon;
