import type { Book, ComparisonResult } from "../models/comparison.model.js";

export function compareBooks(notionBooks: Book[], kindleBooks: Book[]): ComparisonResult {
  const result: ComparisonResult = {
    newBooks: [],
    updatedBooks: [],
  };
  
  const getBookKey = (book: Book) => `${book.title.toLowerCase()}|${book.author.toLowerCase()}`;

  const notionBookMap = new Map<string, Book>();
  for (const book of notionBooks) {
    notionBookMap.set(getBookKey(book), book);
  }

  for(const kindleBook of kindleBooks) {
    const key = getBookKey(kindleBook);
    const notionBook:Book | undefined= notionBookMap.get(key);
    if(!notionBook) {
      result.newBooks.push(kindleBook);
      continue;
    }

    const existingClippings = new Set(notionBook.clippings);
    const newClippings = kindleBook.clippings.filter(clip => !existingClippings.has(clip));
    if(newClippings.length > 0) {
      const bookToPush: Book = {
        title: kindleBook.title,
        author: kindleBook.author,
        clippings: newClippings,
      };
    
      if (notionBook.id !== undefined) {
        bookToPush.id = notionBook.id;
      }
      result.updatedBooks.push(bookToPush);
    }
  }

  return result;
}
