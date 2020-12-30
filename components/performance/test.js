const perf = require('../../checkPerformance.js');

module.exports = function test(eachSeq) {
    return new Promise(async function (resolve, reject) {
        console.log('!!!', perf.userData, eachSeq)
        let eachUserData = perf.userData[eachSeq];

        console.log(`[test] test success`);

        perf.after(eachUserData);
        return resolve(true);
    })
}