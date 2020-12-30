const fs = require('fs');

const perf = require('./components/checkPerformance.js');
const report = require('./components/sendReport.js');
const SETTING = require('./setting.json');
const args = process.argv.slice(2);

switch (args[0]) {
    case 'performance':
        runPerformance(args.slice(1));
        break;
    case 'compliment':
        runSendReport(args.slice(1));
        break;
    default:
        console.log('Sorry, that is not something I know how to do.');
}

function runSendReport(runCmdList = []) {
    report.init(SETTING).run();
}

function runPerformance(runCmdList = []) {
    let cmdList = {};
    fs.readdir('./components/performance', (err, files) => {
        files.forEach(file => {
            if (/\S+(\.js)$/.test(file)) {
                let fn = require(`./components/performance/${file}`);
                cmdList[fn.name] = fn;
            }
        });

        // RUN
        const seqList = Object.entries(cmdList).filter(v => runCmdList.includes(v[0])).map(v => v[1]);
        // const seqList = [Login, Battle];
        // const seqList = [Join];
        // const seqList = [Loginout];
        // const seqList = [Resetpub];

        if(seqList.length) {
            console.log("Run seq.\n", seqList);
            perf.init(SETTING, seqList);
            perf.start();
        } else {
            console.warn("Need seq. The below array is a list of registered seqs.\n", Object.keys(cmdList));
        }
    });
}