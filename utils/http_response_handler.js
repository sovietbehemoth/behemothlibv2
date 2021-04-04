function error_handler(code, endpoint) {
    switch (code) {
        case 404: throw `Error: ${endpoint} not found`; break;
        case 401: throw `Error: Denied access to ${endpoint}`; break;
        case 500: throw `Error: Internal server error`; break;
        case 200: break;
        default: throw `Error: ${code}`; break;
    }
}
export { error_handler };
