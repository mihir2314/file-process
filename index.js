const chokidar = require('chokidar');
const config = require('./config');
const getdata = require("./dbcon");
const path = require('path');
const moveFile = require('move-file');
const csvToJson = require('convert-csv-to-json');


let fileLocation = path.join(config.path);
let watcher = chokidar.watch(fileLocation, { persistent: true });
watcher.on('add', async (filepath) => {
    var file = path.basename(filepath);
    let ext = path.extname(filepath);
    if ((config.allowed_types).includes(ext)) {
        let arrOfJson = csvToJson.fieldDelimiter(config.delimeter).formatValueByType().getJsonFromCsv(filepath);
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
            let queryStr = `insert into fileinfo (fileinfoid,file_name,file_status,upload_time,upload_by) values (fileinfoid.nextval,'${file}','unsuccess',CURRENT_TIMESTAMP,'${config.interface}')  `;
            let result = getdata.getData(queryStr);
            console.log(result);
            console.log("file moved to error folder");
            // try {

            //     var sourceInorrect = filepath;
            //     var destinationIncorrect = path.basename(filepath);
            //     moveFile(sourceInorrect, config.in_err + destinationIncorrect);
            //     console.log(`something went wrong with ${file} it moved to error folder`);
            // } catch (error) {
            //     console.log("error while file moveing " + error);
            // }
        }
        else {


            let queryStr = `insert into fileinfo (fileinfoid,file_name,file_status,upload_time,upload_by) values (fileinfoid.nextval,'${file}','success',CURRENT_TIMESTAMP,'${config.interface}') `;
            let result = getdata.getData(queryStr);
            console.log(result);

            setTimeout(async () => {


                let queryStr = `select MAX(fileinfoid) as last_id  from fileinfo `;
                result = await getdata.getData(queryStr);
                last_id = (result.rows[0]).LAST_ID;
                console.log(result);





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

                }
            }, 1000);
            console.log(`data of ${file} is inserted in database`);
            console.log("\n");

            // try {
            //     var sourceCorrect = filepath;
            //     var destinationCorrect = path.basename(filepath);
            //     moveFile(sourceCorrect, config.in_ar + destinationCorrect);
            //     console.log('The file  ' + destinationCorrect + ' has been moved to in_archive folder ');
            // } catch (error) {
            //     console.log("error while file moveing " + error);
            // }



        }

    }
    else {
        console.log(filepath + " invalid file found ");
    }
})