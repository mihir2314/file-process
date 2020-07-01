module.exports = {
    user: 'system',
    password: '1234',
    connectString: 'localhost:1521/ORCL1',
    path: 'E:/credence/15-06-2020/file_process/in/',
    in_ar: 'E:/credence/15-06-2020/file_process/in_archive/',
    in_err: 'E:/credence/15-06-2020/file_process/error/',
    delimeter: ';',
    interface: 'Mihir',
    allowed_types: ['.csv', '.txt'],
    field_config: {
        "map": [{ "name": "name", "age": "age", "area": "area", "des": "des" }],
        "type": [{ "name": "string", "age": "number", "area": "string", "des": "string" }]
    },


}

