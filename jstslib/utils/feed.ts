import { token, bot, headers } from "../../token.ts";

interface message_struct_u {
    id: string,
    content: string,
    channel: string,
    mentions_everyone: boolean,
    timestamp: string,
    author: {
        id: string,
        username: string,
        profile_picture: string,
        discriminator: string, 
    }
}
//**Convert jSON into a message structure*/
async function encode_message_struct_u(json: any): Promise<any> {
    const struct:message_struct_u = {
        id: json.id,
        content: json.content,
        channel: json.channel_id,
        mentions_everyone: json.mention_everyone,
        timestamp: json.timestamp,
        author: {
            id: json.author.id,
            username: json.author.username,
            profile_picture: json.author.avatar,
            discriminator: json.author.discriminator
        }
    }
    return struct;
}

/**Run a message feed, similar to a websocket and useful for user accounts.*/
class feed {
    private channel: string;
    private feed: any;
    private id_stack: Array<string>;
    constructor(channel_id: string) {
        this.channel = channel_id;
        this.id_stack = [];
    }

    //**Start feed*/
    public async start(callback: (content: any) => any): Promise<void> {
        this.feed = setInterval(async () => {
            const req = await fetch(`https://discord.com/api/v8/channels/${this.channel}/messages?limit=1`, {
                "credentials": "include",
                "headers": {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                "method": "GET",
                "mode": "cors"
            });
            const strset = JSON.stringify(await req.text());
            const strform = strset.substring(2, strset.length - 1);
            const json = JSON.parse(strform);
            if (!this.id_stack.includes(json.id)) {
                this.id_stack.push(json.id);
                callback(encode_message_struct_u(json));
            }
        }, 500);      
    }

    public async stop(): Promise<void> {
        clearInterval(this.feed);
    }
}


export { feed };

/*
const p = Deno.run({
                cmd: [
                    "python",
                    "./utils/feed_handler/message_feed.py",
                    this.channel,
                    token
                ],
                stdout: "piped",
                stderr: "piped"
            })
            if (bot === "true") throw "Using a bot account with a message feed is unnecessary, use a websocket instead";
            const { code } = await p.status();
            const rawOutput = await p.output();
            const rawError = await p.stderrOutput();

            if (code === 0) {
                //await Deno.stdout.write(rawOutput);
                const decode_1 = new TextDecoder().decode(rawOutput).trim();
                const decode = await format_response(decode_1.substring(1, decode_1.length - 1).split(","));
                if (!this.id_stack.includes(decode[0]))
                    await callback(decode);
                    await this.id_stack.push(decode[0]);
            } else {
                const errorString = new TextDecoder().decode(rawError);
                console.log(errorString);
            }
        }, 5);
*/
