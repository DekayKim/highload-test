const perf = require('../checkPerformance.js');
const request = require('request-promise-native');

module.exports = function loginout(eachSeq) {
    return new Promise(async function (resolve, reject) {
        let eachUserData = perf.userData[eachSeq];
        eachUserData.userId = perf.makeAccountId(eachSeq);

        let res = await request({
            uri: perf.options.host+ "/confirm/get_sid",
            method: "POST",
            form: {}
        });
        eachUserData.sid = JSON.parse(res).sid;

        for (let i = 0; i < 5; i++) {
            await perf.callReq('/confirm/login', eachSeq, {
                form: {
                    sid: eachUserData.sid,
                    id: eachUserData.userId,
                    pw: 'perftest',
                    env: 'web'
                }
            });
            await perf.callReq('/confirm/logout', eachSeq);

            await perf.sleep(1);
        }

        perf.after(eachUserData);
        return resolve(true);
    })
}