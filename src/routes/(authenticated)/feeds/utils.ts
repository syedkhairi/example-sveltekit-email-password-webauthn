import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';

export function parsedPostToHtml(post: FeedViewPost) {
  if (!post.post?.record?.text) {
    return '';
  }

  const text = post.post.record.text as string;
  
  // Get facets from the post record
  // The facets might be in different locations based on API response structure
  const facets = post.post.record.facets || 
                (post.post.record as any).facets || 
                [];

  if (!facets || facets.length === 0) {
    return text;
  }

  // Create a copy of the text where we'll replace segments
  let result = text;
  
  // Keep track of offset changes as we replace text
  let offset = 0;
  
  // Sort facets by start index in ascending order to properly handle offsets
  // This ensures we process mentions and links from start to end
  const sortedFacets = [...facets].sort((a, b) => 
    (a.index?.byteStart || 0) - (b.index?.byteStart || 0)
  );

  // UTF-8 encoded byte string must be used for proper indexing
  // JavaScript strings use UTF-16, which can cause incorrect indexing for multi-byte characters
  const textBytes = new TextEncoder().encode(text);
  
  for (const facet of sortedFacets) {
    if (!facet.index) continue;

    const { byteStart, byteEnd } = facet.index;
    
    // Ensure we have valid indices before slicing
    if (typeof byteStart !== 'number' || typeof byteEnd !== 'number' ||
        byteStart < 0 || byteEnd > textBytes.length || byteStart >= byteEnd) {
      continue;
    }

    // Convert byte indices to string indices for JavaScript string operations
    // This is crucial for handling multi-byte Unicode characters correctly
    const stringStart = new TextDecoder().decode(textBytes.slice(0, byteStart)).length;
    const stringEnd = stringStart + new TextDecoder().decode(textBytes.slice(byteStart, byteEnd)).length;

    // Apply offset to current position
    const adjustedStart = stringStart + offset;
    const adjustedEnd = stringEnd + offset;

    // Get the exact segment that needs to be replaced
    const segment = text.substring(stringStart, stringEnd);

    for (const feature of facet.features || []) {
      if (!feature || !feature.$type) continue;

      let replacement = '';
      
      if (feature.$type === 'app.bsky.richtext.facet#mention') {
        // For mentions, use the DID to create a better profile link when available
        const did = feature.did;
        if (did) {
          replacement = `<a href="https://bsky.app/profile/${did}" class="mention">${segment}</a>`;
        } else {
          // Fallback to using the handle directly, ensuring @ is removed if present
          const handle = segment.startsWith('@') ? segment.slice(1) : segment;
          replacement = `<a href="https://bsky.app/profile/${handle}" class="mention">${segment}</a>`;
        }
      } 
      else if (feature.$type === 'app.bsky.richtext.facet#link') {
        // Convert URL to link with proper URI (not URL) as specified in the Python code
        const uri = feature.uri || segment;
        replacement = `<a href="${uri}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
      }
      
      if (replacement) {
        // Replace the segment with our HTML
        result = result.substring(0, adjustedStart) + replacement + result.substring(adjustedEnd);
        
        // Update offset for future replacements
        offset += replacement.length - (adjustedEnd - adjustedStart);
      }
    }
  }

  return result;
}