import { bot, token } from "../token.ts";
import { message_send, message_delete } from "./message.ts"
if (bot === "false") throw "Error: interacting with the WebSocket is only permitted for bot accounts";

let event_instance: any;

const heartbeat_s = {
    "op": 1,
    "d": null
}

interface settings {
    on_error: "reconnect" | "disconnect",
    on_reconnect_order: "reconnect" | "disconnect",

    log_heartbeats: boolean,
    log_identification: boolean,
    callback_send_all_messages: boolean,
    callback: any,
}

type event_options = "message" | "typing" | "message_edit";

interface message_properties {
    content: string,
    tts: boolean,
    timestamp: string,
    pinned: boolean,
    mentions_everyone: boolean, 
    author: user_properties,
    bot: boolean,
    channel_id: string,
    server_id: string
}

interface user_properties {
    id: string,
    username: string,
    discriminator: string,
    avatar_hash: string,
    bot: boolean,
    system: boolean,
    tfa_enabled: boolean,
    language: string,
    verified: boolean,
    email: string,
    flags: number,
    premium_type: number,
    public_flags: number
}

interface member_properties {
    nickname: string,
    roles: Array<string>,
    join_date: string,
    boosting_since: string,
    deafened: boolean,
    muted: boolean,
    is_pending: boolean,
    permissions: string,
    user: user_properties
}

interface typing_properties {
    server_id: string,
    channel_id: string,
    timestamp: string,
    member: member_properties
}

/**Encode a user object payload into an interface object */
function encode_user_object(object: any): user_properties {
    const user_product: user_properties = {
        id: object.id,
        username: object.username,
        discriminator: object.discriminator,
        avatar_hash: object.avatar,
        bot: object.bot,
        system: object.system,
        tfa_enabled: object.mfa_enabled,
        language: object.locale,
        verified: object.verified,
        email: object.email,
        flags: object.flags,
        premium_type: object.premium_type,
        public_flags: object.public_flags
    }; return user_product;
}

/**Encode a member object payload into an interface object */
function encode_member_object(object: any): member_properties {
    const member_product: member_properties = {
        nickname: object.nickname,
        roles: object.roles,
        join_date: object.joined_at,
        boosting_since: object.premium_since,
        deafened: object.deaf,
        muted: object.mute,
        is_pending: object.pending,
        permissions: object.permissions,
        user: encode_user_object(object.user)
    }; return member_product;
}

/**Parse websocket incoming data */
function event_init(message: any, socket: any, callback: any, intent: string): any {
    const payload = JSON.parse(message.data.toString());
    const heartbeat = JSON.stringify(heartbeat_s);
    switch (payload.op) {
        case 10:
            setInterval(() => {
                socket.send(heartbeat);
            }, 41250)
            const identifyinfo = { "op": 2, "d":{ "token": token, "intents": 32509, "properties":{ "$os": "linux", "$browser": "behemothlib", "$device": "behemothlib"}} };
            socket.send(JSON.stringify(identifyinfo));
        break;
        case 9: throw "Error: Client connection error occurred";
        case 7: 
            socket.close();
        break;
        case 1: socket.send(heartbeat); break;
        case 0:
            if (payload.op === 0 && payload.t === "MESSAGE_CREATE" && intent === "message_create") {
                const message_object: message_properties = {
                    content: payload.d.content,
                    tts: payload.d.tts,
                    timestamp: payload.d.timestamp,
                    pinned: payload.d.pinned,
                    mentions_everyone: payload.d.mention_everyone, 
                    author: encode_user_object(payload.d.author),
                    bot: payload.d.author.bot,
                    channel_id: payload.d.channel_id,
                    server_id: payload.d.guild_id
                }
                callback(message_object);
                event_instance = message_object;
                return message_object;
            } else if (payload.op === 0 && payload.t === "TYPING_START" && intent === "typing_start") {
                const typing_object: typing_properties = {
                    server_id: payload.d.guild_id,
                    channel_id: payload.d.channel_id,
                    timestamp: payload.d.timestamp,
                    member: encode_member_object(payload.d.member)
                }
                callback(typing_object);
                event_instance = typing_object;
                return typing_object;
            } else if (payload.op === 0 && payload.t === "MESSAGE_UPDATE" && intent === "message_update") {
                const message_object: message_properties = {
                    content: payload.d.content,
                    tts: payload.d.tts,
                    timestamp: payload.d.timestamp,
                    pinned: payload.d.pinned,
                    mentions_everyone: payload.d.mention_everyone, 
                    author: encode_user_object(payload.d.author),
                    bot: payload.d.author.bot,
                    channel_id: payload.d.channel_id,
                    server_id: payload.d.guild_id
                }
                callback(message_object);
                event_instance = message_object;
                return message_object;
            }
        break;
    }
}

/**Initialize the simple client */
function simple_client_init(data: any, socket: any, callback: any, prefix: string): void {
    const payload = JSON.parse(data.data.toString());
    const heartbeat = JSON.stringify(heartbeat_s);
    switch (payload.op) {
        case 10:
            setInterval(() => {
                socket.send(heartbeat);
            }, 41250)
            const identifyinfo = { "op": 2, "d":{ "token": token, "intents": 512, "properties":{ "$os": "linux", "$browser": "behemothlib", "$device": "behemothlib"}} };
            socket.send(JSON.stringify(identifyinfo));
        break;
        case 9: throw "Error: Client connection error occurred";
        case 7: 
            socket.close();
        break;
        case 1: socket.send(heartbeat); break;
        case 0:
            if (payload.t === "MESSAGE_CREATE") {
                const content: string = payload.d.content;
                if (content.startsWith(prefix.trim())) {
                    const message_object: message_properties = {
                        content: payload.d.content,
                        tts: payload.d.tts,
                        timestamp: payload.d.timestamp,
                        pinned: payload.d.pinned,
                        mentions_everyone: payload.d.mention_everyone, 
                        author: encode_user_object(payload.d.author),
                        bot: payload.d.author.bot,
                        channel_id: payload.d.channel_id,
                        server_id: payload.d.guild_id
                    }
                    const command: string = content.split(prefix)[1].split(" ")[0].trim();
                    let args: Array<any> = content.split(prefix)[1].split(" ");
                    event_instance = message_object;
                    args.shift();
                    callback(command, args);
                }
            }
        break;
    }
}

class client {
    private socket_instance: WebSocket;

    /**Create a new discord client */
    constructor(setting?: settings) {
        console.log("Client started");
        const url = "wss://gateway.discord.gg/?v=8&encoding=json";
        const socket = new WebSocket(url);
        this.socket_instance = socket;
    }

    /** Fired when the client received an event*/
    public on(event: event_options, callback: (message: any) => any): any {
        switch (event) {
            case "message":
                this.socket_instance.onmessage = function (message): void {
                    event_init(message, this, callback, "message_create");
                }
            break;
            case "typing":
                this.socket_instance.onmessage = function (typing): void {
                    event_init(typing, this, callback, "typing_start");
                }
            break;
            case "message_edit":
                this.socket_instance.onmessage = function (edit): void {
                    event_init(edit, this, callback, "message_update");
                }
        }
    }

    /**Create a simple bot. Callback parameter 'command' is the first argument and parameter 'args' are all that follow*/
    public simple_client(prefix: string, callback: (command: string, args: Array<any>) => any): void {
        this.socket_instance.onmessage = function (data): void {
           simple_client_init(data, this, callback, prefix);
        }
    }

    /**Disconnects the bot from discord */
    public shutdown(): void {
        this.socket_instance.close();
    }

    /**Respond to the latest message */
    public respond(content: string): void {
        message_send(content, event_instance.channel_id);
    }

    /**Delete the latest message */
    public delete(): void {
        message_delete(event_instance.id, event_instance.channel_id);
    }
    
}


export { client };
