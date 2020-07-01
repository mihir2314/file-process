var oracledb = require('oracledb');
const chokidar = require('chokidar');
const config = require('./config.js');
const path = require('path');
const getdata = require("./dbcon");
const csvToJson = require('convert-csv-to-json');

function reading_files() {
    let fileLocation = path.join(config.path);
    let watcher = chokidar.watch(fileLocation, { persistent: true });
    watcher.on('add', async (filepath) => {
        var file = path.basename(filepath);
        let ext = path.extname(filepath);
        if ((config.allowed_types).includes(ext)) {
            let arrOfJson = await csvToJson.fieldDelimiter(config.delimeter).formatValueByType().getJsonFromCsv(filepath);
            //  console.log("file  " + file);
            // console.log(arrOfJson);
            let errConfigType = 0;
            for (let json of arrOfJson) {
                //validating datatype
                let configType = (config.field_config.type)[0];
                for (let type of Object.keys(configType)) {
                    if (configType[type] != typeof (json[type])) {
                        errConfigType = 1;
                    }
                }
            }
            if (errConfigType) {
                file_move_to_error(file);
            } else {
                file_move_to_inarchive(file, arrOfJson);
            }
        }
    })
}
async function file_move_to_error(file) {
    console.log("file move to error folder");
    let insert_fileinfo_unsuccess = `insert into fileinfo (fileinfoid,file_name,file_status,upload_time,upload_by) values (fileinfoid.nextval,'${file}','unsuccess',CURRENT_TIMESTAMP,'${config.interface}')  `;
    let result = await getdata.getData(insert_fileinfo_unsuccess);
    console.log(result);
}
async function file_move_to_inarchive(file, arrOfJson) {
    //  console.log("file move to in_archive folder");
    console.log("file  " + file);
    let insert_fileinfo_success = `insert into fileinfo (fileinfoid,file_name,file_status,upload_time,upload_by) values (fileinfoid.nextval,'${file}','success',CURRENT_TIMESTAMP,'${config.interface}')  `;
    let result = await getdata.getData(insert_fileinfo_success);
    console.log(result);
    insertinto_filedata(file, arrOfJson);
}
async function insertinto_filedata(file, arrOfJson) {
    console.log(`we are inside insert file id of file ` + file);
    let queryStr = `select MAX(fileinfoid) as last_id  from fileinfo `;
    result = await getdata.getData(queryStr);
    last_id = result.rows[0].LAST_ID;
    console.log(result);
    insert(last_id, arrOfJson, file);
}
function insert(last_id, arrOfJson, file) {
    for (let json of arrOfJson) {
        //Mapping data 
        let mapJson = (config.field_config.map)[0];
        let onlyKeys = Object.keys(mapJson);
        let columns = "";
        let values = "";
        for (let i = 0; i < onlyKeys.length; i++) {
            let tmpValues = json[mapJson[onlyKeys[i]]];
            if (typeof (tmpValues) != "number") {
                tmpValues = `'${tmpValues}'`;
            }
            if (i == (onlyKeys.length) - 1) {
                columns += `${onlyKeys[i]}`;
                values += `${tmpValues}`;
            }
            else {
                columns += `${onlyKeys[i]},`;
                values += `${tmpValues},`;
            }
        }
        let queryStr = `insert into filedata (filedataid,file_info_id,${columns}) values (filedataid.nextval,${last_id},${values})`;
        let result = getdata.getData(queryStr);
        ///console.log(result);
    }
    console.log(`data of ${file} is inserted in database`);
    console.log("\n");
}
return reading_files();