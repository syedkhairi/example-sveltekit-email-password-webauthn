import type { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import type { PageServerLoad } from './$types';
import { CredentialSession, Agent } from '@atproto/api';
import { parsedPostToHtml } from './utils';

const link = 'at://did:plc:dewdipjc5zgwjxgvdf4ffxi4/app.bsky.feed.generator/uked-edusky'
export const load = (async ({ locals }) => {
    try {
        // Create a proper BskyAgent instance
        const session = new CredentialSession(new URL('https://bsky.social'));

        await session.login({
            identifier: 'mrkhairi.com',
            password: 'flzn-bdfl-xl4f-xfhm'
        })

        const agent = new Agent(session);
        locals.agent = agent;
    
        // Fetch the feed
        const feed = await agent.app.bsky.feed.getFeed({
            feed: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/hot-classic'
        });

        return {
          cursor: feed.data.cursor,
          posts: feed.data.feed.map((post) => {
            return {
                text: parsedPostToHtml(post),
                datetime: post.post.indexedAt,
                username: post.post.author.handle,
                avatarUrl: post.post.author.avatar,
                name: post.post.author.displayName,
                likes: post.post.likeCount,
            }
          })      
        }
    } catch (error) {
        console.error('Error fetching feed:', error);
        return {
            cursor: null,
            posts: []
        };
    }

    // const response = await fetch('https://dummyjson.com/comments');
    // const data = await response.json();
    // return {
    //     posts: data.comments
    // };
}) satisfies PageServerLoad;