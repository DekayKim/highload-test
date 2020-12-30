const perf = require('../checkPerformance.js');
const request = require('request-promise-native');

module.exports = function login(eachSeq) {
    return new Promise(async function (resolve, reject) {
        let eachUserData = perf.userData[eachSeq];
        eachUserData.userId = perf.makeAccountId(eachSeq);

        let res = await request({
            uri: perf.options.host+ "/confirm/get_sid",
            method: "POST",
            form: {}
        });
        eachUserData.sid = JSON.parse(res).sid;

        // await callReq('/get/server_time', eachSeq);
        // await callReq('/get/rkey', eachSeq);
        eachUserData.dungeon = (await perf.callReq('/get/info/ko', eachSeq, {
            form: {
                sid: eachUserData.sid
            }
        })).dungeon;
        await perf.callReq('/confirm/login', eachSeq, {
            form: {
                sid: eachUserData.sid,
                id: eachUserData.userId,
                pw: 'perftest',
                env: 'web'
            }
        });

        perf.after(eachUserData);
        return resolve(true);
    })
}