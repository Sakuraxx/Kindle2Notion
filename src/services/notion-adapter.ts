import type { Book } from "../models/comparison.model.js";
import type { NotionBookClipping } from "../models/notion-clipping.model.js";

export function adaptNotionBooksToStandardBooks(notionBooks: NotionBookClipping[]): Book[] {
  return notionBooks.map(nb => ({
    id: nb.id,
    title: nb.title,  
    author: nb.author,
    clippings: nb.blocks.map(b => b.content)
  }));
}