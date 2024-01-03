const helper = require('./helper'); //includes helper file
const { printProcessInfo, printFileContents } = require('./helper');
const figlet = require('figlet');

figlet('Hello, Assignment1!', function (err, data) {
    if (!err) {
        console.log(data);
    }
})

process.env.PORT = 7975 || 8000;
printProcessInfo();
// printFileContents('helper.js');

require('./route');
