const perf = require('../../checkPerformance.js');
const request = require('request-promise-native');

module.exports = function resetpub(eachSeq) {
    return new Promise(async function (resolve, reject) {
        let eachUserData = perf.userData[eachSeq];
        eachUserData.userId = perf.makeAccountId(eachSeq);

        let res = await request({
            uri: perf.options.host+ "/confirm/get_sid",
            method: "POST",
            form: {}
        });
        eachUserData.sid = JSON.parse(res).sid;

        await perf.callReq('/get/server_time', eachSeq);
        await perf.callReq('/get/rkey', eachSeq);
        await perf.callReq('/confirm/login', eachSeq, {
            form: {
                sid: eachUserData.sid,
                id: eachUserData.userId,
                pw: 'perftest',
                env: 'web'
            }
        });

        await perf.callReq('/set/reset_pub', eachSeq, {
            form: {
                sid: eachUserData.sid
            }
        }, true);

        perf.after(eachUserData);
        return resolve(true);
    })
}