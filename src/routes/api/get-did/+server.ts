import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    return new Response();
};

export const POST: RequestHandler = async (event) => {
    // Add a long delay
    // await new Promise(resolve => setTimeout(resolve, 100000));
    const { handle } = await event.request.json();

    if (!handle) {
        return new Response(JSON.stringify({
            message: "No handle provided"
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const url = `https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${handle}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    });
    if (!response.ok) {
        return new Response(JSON.stringify({
            message: "Error fetching handle"
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    const data = await response.json();
    if (!data.did) {
        return new Response(JSON.stringify({
            message: "No DID found"
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    if (data.did) {
        return new Response(JSON.stringify({
            did: data.did
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return new Response(JSON.stringify({
        message: "Connection timeout or network error. Please try again later."
    }), {
        status: 503,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}