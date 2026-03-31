module.exports = (fields, data) => {
    extractedData = {};
    fields.forEach(field => {
        if(data[field]) {
            extractedData[field] = data[field];
        }
    })
    return extractedData;
}