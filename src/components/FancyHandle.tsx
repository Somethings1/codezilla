// components/FancyHandle.tsx
'use client';

import { PanelResizeHandle } from 'react-resizable-panels';
import './FancyHandle.css'; // CSS file for the styles

export function FancyHandle({ direction }: { direction: 'horizontal' | 'vertical' }) {
  return (
    <PanelResizeHandle className={`fancy-handle ${direction}`}>
      <div className="fancy-pill" />
    </PanelResizeHandle>
  );
}

