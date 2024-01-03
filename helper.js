const fs = require('fs');

function printProcessInfo() {
    console.log("== process.env:", process.env);
    console.log("== process.env.PORT:", process.env.PORT);
}

function printFileContents(filename) {
    fs.readFile(filename, 'utf-8', function (err, data) {
        if (!err) {
            console.log(data);
        }
    });
}

module.exports = {
    printProcessInfo: printProcessInfo,
    printFileContents: printFileContents,
};
