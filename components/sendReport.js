const os = require('os');
const fs = require('fs');
const request = require('request-promise-native');


module.exports = new class checkPerformance {
    constructor(options) {}

    init(options) {
        this.options = options;
        // this.userData = new Array(options.userCount);

        return this;
    }

    start() {
        //* 웹훅 설정
        let webhookForm = {
            body : "[[IMS-CRON]](https://ims.zip-lab.co.kr:3729/cron) 예약 Call 실행 결과",
            connectInfo : [{
                title : "Name",
                description : `No.${el.no} - ${el.description}`
            },{
                title : "URI",
                description : el.call_url
            }]
        };

        if (parseBody.status == 'success') {
            webhookForm.connectInfo.push({ title: "SUCCESS", description: parseBody.data || "" });
            webhookForm.connectColor = "#0ea432";
        } else if (parseBody.status == 'fail') {
            webhookForm.connectInfo.push({ title: "FAIL", description: parseBody.data || "" });
            webhookForm.connectColor = "#d01919";
        } else if (error) {
            webhookForm.connectInfo.push({ title: "ERROR", description: error });
            webhookForm.connectColor = "#d01919";
        } else if (parseBody.status == 'nothing') {
            return;
        }

        request.post({
            uri: 'https://wh.jandi.com/connect-api/webhook/19763163/bacd74a77af96f5c140cd906a8cc24ae',
            headers: {
                'Accept': 'application/vnd.tosslab.jandi-v2+json',
                'Content-Type': 'application/json'
            },
            form: webhookForm
        });
    }
}