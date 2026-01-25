// src/hooks/useKindleData.ts
import { useState, useMemo } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { parseKindleClippings } from "../services/kindle-parser";
import type { KindleClipping, BookGroup } from "../models/kindle-clipping.model";

export function useKindleData() {
  const [kindleClippings, setKindleClippings] = useState<KindleClipping[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const handleImport = async (onSuccess: (count: number) => void) => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Text files", extensions: ["txt"] }],
    });

    if (selected && typeof selected === "string") {
      const content = await readTextFile(selected);
      const data = await parseKindleClippings(content);
      setKindleClippings(data);
      setSelectedIndices(new Set());
      onSuccess(data.length);
    }
  };

  const handleToggle = (indices: number[]) => {
    const next = new Set(selectedIndices);
    const allPresent = indices.every(idx => next.has(idx));
    if (allPresent) indices.forEach(idx => next.delete(idx));
    else indices.forEach(idx => next.add(idx));
    setSelectedIndices(next);
  };

  const displayGroups = useMemo(() => {
    const groups = new Map<string, BookGroup>();
    kindleClippings.forEach((clipping, index) => {
      const matches = clipping.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      clipping.content.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matches) return;
      const key = `${clipping.bookName}|${clipping.author}`;
      if (!groups.has(key)) groups.set(key, { key, bookName: clipping.bookName, author: clipping.author, children: [] });
      groups.get(key)!.children.push({ originalIndex: index, clipping });
    });
    return Array.from(groups.values());
  }, [kindleClippings, searchTerm]);

  return { 
    kindleClippings, selectedIndices, searchTerm, setSearchTerm, 
    displayGroups, handleImport, handleToggle 
  };
}