import React from 'react';
import { KindleClipping } from '../../models/kindle-clipping.model';
import "./ClippingTree.css";

export const ClippingItem: React.FC<{
  item: KindleClipping;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ item, isSelected, onToggle }) => {
  return (
    <div className="clipping-item">
      <input type="checkbox" checked={isSelected} onChange={onToggle} />
      <div style={{ flex: 1 }}>
        <p className="clipping-content">{item.content}</p>
        <div className="clipping-date">
          📅 {item.timestamp.toLocaleString()}
        </div>
      </div>
    </div>
  );
};