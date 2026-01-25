import type { Book } from "../models/comparison.model.js";
import type { KindleClipping } from "../models/kindle-clipping.model.js";

export function adaptKindleClippingsToBooks(kindleClippings: KindleClipping[]): Book[] {
  const bookMap = new Map<string, Book>();
  const getBookKey = (title: string, author: string) => `${title.toLowerCase()}|${author.toLowerCase()}`;

  for (const clipping of kindleClippings) {
    const bKey = getBookKey(clipping.bookName, clipping.author);
    if (!bookMap.has(bKey)) {
      bookMap.set(bKey, {
        title: clipping.bookName,
        author: clipping.author,
        clippings: []
      });
    }
    const book = bookMap.get(bKey);
    if (book) {
      book.clippings.push(clipping.content);
    }
  }

  return Array.from(bookMap.values());
}