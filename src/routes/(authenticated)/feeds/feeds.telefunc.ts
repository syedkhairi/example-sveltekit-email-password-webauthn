import { Agent } from '@atproto/api';
import { CredentialSession } from '@atproto/api';
import { parsedPostToHtml } from './utils';

export async function getMorePosts(feed: string, cursor: string | null) {
     // Create a proper BskyAgent instance
    const session = new CredentialSession(new URL('https://bsky.social'));

    await session.login({
        identifier: 'mrkhairi.com',
        password: 'flzn-bdfl-xl4f-xfhm'
    })

    const ag = new Agent(session);

    // Fetch the feed
    const feeds = await ag.app.bsky.feed.getFeed({
        feed: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/hot-classic',
        cursor: cursor ?? undefined,
        limit: 10,
    });
    const posts = feeds.data.feed.map((post) => {
        return {
            text: parsedPostToHtml(post),
            datetime: post.post.indexedAt,
            username: post.post.author.handle,
            avatarUrl: post.post.author.avatar,
            name: post.post.author.displayName,
            likes: post.post.likeCount,
        }
    });
    return {
        posts: posts,
        cursor: feeds.data.cursor,
    }
}