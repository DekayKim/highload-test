const perf = require('../checkPerformance.js');
const request = require('request-promise-native');

module.exports = function join(eachSeq) {
    return new Promise(async function (resolve, reject) {
        let eachUserData = perf.userData[eachSeq];
        eachUserData.userId = perf.makeAccountId(eachSeq);

        let res = await request({
            uri: perf.options.host+ "/confirm/get_sid",
            method: "POST",
            form: {}
        });
        eachUserData.sid = JSON.parse(res).sid;

        res = await perf.callReq('/confirm/make_user', eachSeq, {
            form: {
                sid: eachUserData.sid,
                id: eachUserData.userId,
                pw: 'perftest',
                name: eachUserData.userId,
                email: `${eachUserData.userId}@test.com`,
                env: 'web'
            }
        });

        if (res.status === 1) {
            console.log(`[join] ${eachUserData.userId} join success`);
        } else {
            console.warn(`[join] ${eachUserData.userId} join fail`);
        }

        perf.after(eachUserData);
        return resolve(true);
    })
}