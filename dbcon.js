const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;
const config = require('./config');
async function run(queryStr) {
    let connection;
    try {
        connection = await oracledb.getConnection(config);
        var result = await connection.execute(queryStr);
        return result;
    }
    catch (err) {
        console.error(err);
        console.log("error");
    }
}
module.exports.getData = run;
