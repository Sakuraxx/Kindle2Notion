import React from 'react';
import { KindleClipping } from '../../models/kindle-clipping.model';

export const ClippingItem: React.FC<{
  item: KindleClipping;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ item, isSelected, onToggle }) => {
  return (
    <div style={{ 
      padding: "10px 15px 10px 0", 
      borderBottom: "1px solid #f9f9f9", 
      display: "flex", 
      gap: "12px",
      fontSize: "13px"
    }}>
      <input type="checkbox" checked={isSelected} onChange={onToggle} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 5px 0", color: "#444", lineHeight: "1.5" }}>{item.content}</p>
        <div style={{ fontSize: "11px", color: "#aaa" }}>
          📅 {item.timestamp.toLocaleString()}
        </div>
      </div>
    </div>
  );
};