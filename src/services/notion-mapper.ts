// notion-mapper.ts
import { isFullBlock } from '@notionhq/client';
import { isTextRichTextItemResponse } from '@notionhq/client/build/src/helpers.js';
import type { PageObjectResponse, ListBlockChildrenResponse } from '@notionhq/client';
import type { NotionBookClipping, NotionBlock } from '../models/notion-clipping.model.js';

export function mapToNotionBookClipping(
  page: PageObjectResponse,
  blocksResponse: ListBlockChildrenResponse,
): NotionBookClipping {
  const titleProp = page.properties['Title'];
  const title = (titleProp?.type == 'title' && titleProp.title[0]?.plain_text) || 'Untitled';
  const authorProp = page.properties['Author'];
  const author =
    (authorProp?.type == 'rich_text' && authorProp.rich_text[0]?.plain_text) || 'Unknown Author';
  const blocks: NotionBlock[] = [];
  for (const block of blocksResponse.results) {
    if (!isFullBlock(block)) {
      continue;
    }
    if (block.type === 'quote') {
      const richText = block.quote.rich_text[0];
      if (richText && isTextRichTextItemResponse(richText)) {
        blocks.push({ id: block.id, content: richText.plain_text });
      }
    }
  }
  return {
    id: page.id,
    title,
    author,
    blocks,
  };
}
