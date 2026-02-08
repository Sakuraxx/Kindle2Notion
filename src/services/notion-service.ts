import { Client, type BlockObjectRequest, type CreatePageParameters, type QueryDataSourceResponse, type ListBlockChildrenResponse } from '@notionhq/client';
import { isFullPage} from "@notionhq/client/build/src/helpers.js";
import { mapToNotionBookClipping } from "./notion-mapper.js";
import type { NotionBookClipping } from "../models/notion-clipping.model.js"
import type { Book } from '../models/comparison.model.js';
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { LogCallback, LogType } from '../models/log.model.js';

export async function getAllBookClippings(apiKey: string, dataSourceId: string): Promise<NotionBookClipping[]>
{
  const notion = new Client({ 
    auth: apiKey,
    fetch: tauriFetch as any 
  });

  const allPagesResults: any[] = [];
  let hasMorePages = true;
  let nextPageCursor: string | undefined = undefined;
  while (hasMorePages) {
    const pages: QueryDataSourceResponse = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: nextPageCursor,
      page_size: 100,
    });
    allPagesResults.push(...pages.results);
    hasMorePages = pages.has_more;
    nextPageCursor = pages.next_cursor ?? undefined;
  }

  const fullPages = allPagesResults.filter(isFullPage);
  
  const resultClippings: NotionBookClipping[] = [];
  const BATCH_SIZE = 5;
  for (let i = 0; i < fullPages.length; i += BATCH_SIZE) {
    const batch = fullPages.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (page) => {
      const allBlocks: any[] = [];
      let hasMoreBlocks = true;
      let nextBlockCursor: string | undefined = undefined;
      while (hasMoreBlocks) {
        const blockResp: ListBlockChildrenResponse = await notion.blocks.children.list({
          block_id: page.id,
          start_cursor: nextBlockCursor,
          page_size: 100,
        });
        allBlocks.push(...blockResp.results);
        hasMoreBlocks = blockResp.has_more;
        nextBlockCursor = blockResp.next_cursor ?? undefined;
      }

      const syntheticResponse = {
        results: allBlocks,
        type: 'block',
        block: {},
        object: 'list',
        next_cursor: null,
        has_more: false
      } as unknown as ListBlockChildrenResponse;
      
      return mapToNotionBookClipping(page, syntheticResponse);
    });

    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(r => {
        if(r) resultClippings.push(r);
    });

    await new Promise(resolve => setTimeout(resolve, 200)); 
  }

  return resultClippings;
}

export async function createPageForBook(apiKey: string, datasourceId: string, book: Book) {  
  const pageProperties: CreatePageParameters["properties"] = {
    'Title': {
      type: 'title',
      title: [{ type: 'text', text: { content: book.title } }],
    },
    'Author': {
        type: 'rich_text',
        rich_text: [{ type: 'text', text: { content: book.author } }],
    },
  };

  const createPageParams: CreatePageParameters = {
    parent: {
      type: "data_source_id",
      data_source_id: datasourceId,
    },
    properties: pageProperties
  };

  const notion = new Client({ 
    auth: apiKey,
    fetch: tauriFetch as any
  });
  const createdPageResp = await notion.pages.create(createPageParams);
  book.id = createdPageResp.id;
  await appendBlocksToPage(notion, book);
  return createdPageResp;
}

async function appendBlocksToPage(notion: Client, book: Book) {
  for (let i = 0; i < book.clippings.length; i += 100) {
    const batch: BlockObjectRequest[] = book.clippings.slice(i, i + 100).map(clipping => ({
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: [{
          type: 'text', text: { content: clipping }
        }]
      }
    }));
    await notion.blocks.children.append({
      block_id: book.id!,
      children: batch,
    });
  }
}

export async function createNotionPagesForNewBooks(apiKey: string, datasourceId: string, newBooks: Book[], onLog?: LogCallback)
{
  if (newBooks.length === 0) {
    onLog?.("No new books to create.", LogType.Info);
    return;
  }

  for (const book of newBooks) {
    try {
        await createPageForBook(apiKey, datasourceId, book);
    } catch (error: any) {
        onLog?.(`Failed to create page for "${book.title}". Error: ${error.message}`, LogType.Error);
    }
  }
}

export async function appendNotionBlocksToExistingBooks(apiKey: string, books: Book[], onLog?: LogCallback) {
  const notion = new Client({ 
    auth: apiKey,
    fetch: tauriFetch as any
  });
  for (const book of books) {
    if (!book.id) {
      onLog?.(`Skipping book "${book.title}" as it does not have a Notion page ID.`, LogType.Warn);
      continue;
    }
    try {
        await appendBlocksToPage(notion, book);
    } catch (error: any) {
        onLog?.(`Failed to append blocks for "${book.title}". Error: ${error.message}`, LogType.Error);
    }
  }
  onLog?.(`Successfully appended clippings to existing books.`, LogType.Info);
}