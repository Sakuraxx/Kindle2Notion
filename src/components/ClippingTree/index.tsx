import React from 'react';
import { BookNode } from './BookNode';
import { BookGroup } from '../../models/kindle-clipping.model';
import { useLanguage } from '../../i18n/LanguageContext';
import './ClippingTree.css';

interface ClippingTreeProps {
  groups: BookGroup[];
  selectedIndices: Set<number>;
  onToggle: (indices: number[]) => void;
  collapsedBookKeys?: Set<string>;
  onToggleBookNode?: (key: string) => void;
}

export const ClippingTree: React.FC<ClippingTreeProps> = ({
  groups,
  selectedIndices,
  onToggle,
  collapsedBookKeys,
  onToggleBookNode,
}) => {
  const { t } = useLanguage();

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '6px', background: '#fff' }}>
      {groups.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          {t.clippingTree.noMatching}
        </div>
      ) : (
        groups.map((group) => (
          <BookNode
            key={group.key}
            group={group}
            selectedIndices={selectedIndices}
            onToggle={onToggle}
            isCollapsed={collapsedBookKeys?.has(group.key) ?? false}
            onToggleCollapsed={() => onToggleBookNode?.(group.key)}
          />
        ))
      )}
    </div>
  );
};
