

export function extractMessage<T>(jsonData: Promise<T>, backupMessage: string) {
    let message = '';

    if(jsonData.message || jsonData.msg) {
        message = jsonData.message || jsonData.msg;
    }
    else if(Array.isArray(jsonData.errors)) {
        message = jsonData.errors[0].msg;
    }

    return message || backupMessage;
}