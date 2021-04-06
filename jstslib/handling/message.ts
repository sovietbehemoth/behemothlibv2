import { headers } from "../token.ts";
import { error_handler } from "../utils/http_response_handler.js";

/**
 Sends a message to specified text channel*/
async function message_send(contents: string | number, channel: string, tts?: boolean): Promise<number> {
    let content;
    const url = `https://discord.com/api/v8/channels/${channel}/messages`;
    if (tts === false || tts === undefined) content = {
        "content": contents,
        "tts": false
    }; else content = {
        "content": contents,
        "tts": true
    };
    const post_msg = await fetch(url, {
        method: "POST",
        headers, 
        body: JSON.stringify(content)
    });
    error_handler(post_msg.status, "channel");
    return post_msg.status;
}

/**
 Deletes a message from specified text channel*/
async function message_delete(message: string, channel: string): Promise<number> {
    const url = `https://discord.com/api/v8/channels/${channel}/messages/${message}`;
    const del_msg = await fetch(url, {
        method: "DELETE",
        headers
    });
    error_handler(del_msg.status);
    return del_msg.status;
}

/**
 Edits a message*/
async function message_edit(contents: string, message: string, channel: string): Promise<number> {
    const url = `https://discord.com/api/v8/channels/${channel}/${message}/{message.id}`;
    const content_json = { "content": contents };
    const edit_msg = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(content_json)
    });
    error_handler(edit_msg.status);
    return edit_msg.status;
}

/**
 * Replies to a message*/
async function message_reply(contents: string, server: string, channel: string, message: string): Promise<number> {
    const url = `https://discord.com/api/v8/channels/${channel}/messages`;
    const content_json = {
        "content": contents,
        "message_reference": {
            "channel_id": channel,
            "guild_id": server,
            "message_id": message
        }
    };
    const reply_msg = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(content_json)
    });
    error_handler(reply_msg.status);
    return reply_msg.status;
}

export { message_send, message_reply, message_edit, message_delete };
