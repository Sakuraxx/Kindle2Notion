import React from 'react';
import { ClippingItem } from './ClippingItem';
import { BookGroup } from '../../models/kindle-clipping.model';
import './ClippingTree.css';

export const BookNode: React.FC<{
  group: BookGroup;
  selectedIndices: Set<number>;
  onToggle: (indices: number[]) => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
}> = ({ group, selectedIndices, onToggle, isCollapsed = false, onToggleCollapsed }) => {
  const expanded = !isCollapsed;

  // Check if all clippings under the book are selected
  const allChildIndices = group.children.map(c => c.originalIndex);
  const isAllSelected = allChildIndices.every(idx => selectedIndices.has(idx));

  return (
    <div className="book-node">
      <div className="book-header">
        <button 
          onClick={() => onToggleCollapsed?.()}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", padding: 0, width: "20px" }}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <input 
          type="checkbox" 
          checked={isAllSelected}
          onChange={() => onToggle(allChildIndices)} 
        />
        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onToggleCollapsed?.()}>
          <strong style={{ fontSize: "14px" }}>{group.bookName}</strong>
          <span style={{ fontSize: "12px", color: "#888", marginLeft: "8px" }}>({group.author})</span>
          <span style={{ fontSize: "10px", background: "#eee", padding: "2px 6px", borderRadius: "10px", marginLeft: "8px" }}>
            {group.children.length}
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ paddingLeft: "30px", background: "#fff" }}>
          {group.children.map(child => (
            <ClippingItem 
              key={child.originalIndex}
              item={child.clipping}
              index={child.originalIndex}
              isSelected={selectedIndices.has(child.originalIndex)}
              onToggle={() => onToggle([child.originalIndex])}
            />
          ))}
        </div>
      )}
    </div>
  );
};