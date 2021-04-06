//Define your token here, defining here will set your token globally
const token = "TOKEN";

//Set as false if you are using a user account
let bot: string = "true";

let headers: any;
if (bot === "false") headers = {
    "Authorization": token,
    "Content-Type": "application/json",
    "connection": "keep-alive"
}; else if (bot === "true") headers = {
    "Authorization": `Bot ${token}`,
    "Content-Type": "application/json"
}
export { headers, bot, token };
