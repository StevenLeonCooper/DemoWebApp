// /data/response-object.js
export class ResponseObject {
    constructor(status, message, data) {

        if (status instanceof ResponseObject) {
            return status;
        }

        this.status = status;
        this.message = message;
        this.data = data;
    }

    static ok(data, message = "OK") { return new ResponseObject(200, message, data); }
    static created(data, message = "Created") { return new ResponseObject(201, message, data); }
    static badRequest(message) { return new ResponseObject(400, message, null); }
    static notFound(message) { return new ResponseObject(404, message, null); }
    static notAllowed(message) { return new ResponseObject(405, message, null); }
    static conflict(message) { return new ResponseObject(409, message, null); }
    static error(message = "Internal server error") { return new ResponseObject(500, message, null); }
}