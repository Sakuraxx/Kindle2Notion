export interface KindleClipping {
  bookName: string;
  author: string;
  timestamp: Date;
  content: string;
}

export interface BookGroup {
  key: string; // Book key, e.g., "bookname|author"
  bookName: string;
  author: string;
  children: {
    originalIndex: number;
    clipping: KindleClipping;
  }[];
}