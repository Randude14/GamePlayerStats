

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

export function isValidDate(dateString) {

    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
}