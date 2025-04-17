import type { PageServerLoad } from './$types';
import { CredentialSession, Agent } from '@atproto/api';

export const load = (async () => {
    try {
        // Create a proper BskyAgent instance
        const session = new CredentialSession(new URL('https://bsky.social'));

        await session.login({
            identifier: 'mrkhairi.com',
            password: 'flzn-bdfl-xl4f-xfhm'
        })

        const agent = new Agent(session);
    
        // Fetch the feed
        const feed = await agent.app.bsky.feed.getFeed({
            feed: 'at://did:plc:dewdipjc5zgwjxgvdf4ffxi4/app.bsky.feed.generator/uked-edusky'
        });
        
        return {
            posts: feed.data.feed.map((post) => {
                return {
                    text: post.post.record.text,
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
            posts: []
        };
    }

    // const response = await fetch('https://dummyjson.com/comments');
    // const data = await response.json();
    // return {
    //     posts: data.comments
    // };
}) satisfies PageServerLoad;