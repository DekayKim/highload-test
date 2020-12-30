const os = require('os');
const fs = require('fs');
const request = require('request-promise-native');

fs.writeFileSync('log.json', '');

let _seqIndex = 0;
let _reqCount = 0;
let _accCount = 0;
let _seqCount = 0;
let _seqFinish = 0;
let _itvObj = null;

let elapsedTimeTotal = [];

module.exports = new class checkPerformance {
    constructor(options) {}
    init(options, seqList) {
        this.options = options;
        this.seqList = seqList;
        this.userData = new Array(options.userCount);
    }

    start() {
        let seqFn = this.seqList[_seqIndex];
        _seqCount = 0;
        _seqFinish = 0;

        _itvObj = setInterval(() => {
            console.log(`[SEQ_STARTER] start ${seqFn.name}... ${_seqCount}`);
            this.userData[_seqCount] = Object.assign(this.userData[_seqCount] || {}, {
                elapsedTime: [],
                cpuTimes: []
            });
            // console.log(_seqCount, this.userData);

            seqFn(_seqCount);

            if (++_seqCount >= this.options.userCount) {
                clearInterval(_itvObj);
                console.log(`[SEQ_STARTER] end ${seqFn.name}`);

                // battle 특별 로그
                if (_seqIndex === 1) {
                    console.log(`[SEQ_TIMER] 30s - call: ${_reqCount - _accCount}`)
                    _accCount = _reqCount;
                    _itvObj = setInterval(() => {
                        console.log(`[SEQ_TIMER] 30s - call: ${_reqCount - _accCount}`)
                        _accCount = _reqCount;
                    }, 30 * 1000);
                }
            }

        }, 1000 / this.options.loginPerSec);
    }

    after(eachUserData) {
        if (eachUserData.elapsedTime.length > 0) {
            let elapsedAvg = eachUserData.elapsedTime.reduce((acc, val) => acc + val) / eachUserData.elapsedTime.length;
            let cpuTimesAvg = eachUserData.cpuTimes.reduce((acc, val) => acc + val) / eachUserData.cpuTimes.length;
            elapsedTimeTotal.push(elapsedAvg);

            console.log(`[USER_END] ${eachUserData.userId} / ${elapsedAvg.toFixed(2)}ms, ${cpuTimesAvg.toFixed(2)}%`);
        } else {
            console.log(`[USER_END] ${eachUserData.userId} / No elapsedTime, cpuTimes`);
        }


        if (++_seqFinish >= this.options.userCount) { // 시퀀스 종료한 유저가 유저수보다 같거나 많을 경우 진입
            if (++_seqIndex == this.seqList.length) { // 모든 시퀀스가 종료된 경우
                clearInterval(_itvObj);

                if (elapsedTimeTotal.length > 0) {
                    let elapsedTotalAvg = elapsedTimeTotal.reduce((acc, val) => acc + val) / elapsedTimeTotal.length;
                    console.log(`[TOTAL_ELAPSED_TIME] ${elapsedTotalAvg.toFixed(2)}ms`);
                }

                process.exit();
            } else { // 아직 다음 시퀀스가 남아있는 경우
                this.start();
            }
        };
    }

    async callReq(uri, eachSeq, opt, recordPerf = false) {
        opt = Object.assign({
            uri: this.options.host + uri,
            method: "POST",
            form: {},
            resolveWithFullResponse: true,
            time: true
        }, opt);

        let response = await request(opt).catch((err) => {
            console.warn(`[REQ_ERR] ${err.options.uri} / ${JSON.stringify(err.options.form)}`);
            fs.writeFileSync('log.json', `[${err.options.uri}] ${err.response.body}\n`, {
                flag: 'a',
                encoding: 'utf-8'
            });
            return false;
        })
        // console.warn(`[REQ_SND] ${response.request.uri.href} / ${JSON.stringify(response.request.body)}`);
        // fs.writeFileSync('log.json', `[${JSON.stringify(opt.form)}] ${response.body}\n`, {
        //     flag: 'a',
        //     encoding: 'utf-8'
        // });

        if (!response) {
            return false;
        }

        if (recordPerf) {
            this.userData[eachSeq].elapsedTime.push(response.elapsedTime);

            let nowCpuTimeArr = (os.cpus()).map((eachCpu) => {
                let totalCapa = Object.values(eachCpu.times).reduce((acc, val) => acc + val);
                return ((1 - eachCpu.times.idle / totalCapa) * 100); // .toFixed(1) + '%'
            })
            this.userData[eachSeq].cpuTimes.push(nowCpuTimeArr.reduce((acc, val) => acc + val) / nowCpuTimeArr.length);
        }

        let logtxt = `[${new Date().toLocaleTimeString()} ${_reqCount++} ${response.statusCode} - ${this.makeAccountId(eachSeq)}/${this.userData[eachSeq].sid}] ${uri}`;

        if (this.userData[eachSeq].nowDungeonNo) {
            logtxt += ` - (dungeon_${this.userData[eachSeq].nowDungeonNo})`;
        }
        fs.writeFileSync('log.json', logtxt + '\n', {
            flag: 'a',
            encoding: 'utf-8'
        });

        try {
            return JSON.parse(response.body);
        } catch (error) {
            return {};
        }
    }

    makeAccountId(seq) {
        return `perftest${seq}`;
    }

    sleep(sec) {
        return new Promise((resolve) => {
            setTimeout(resolve, sec * 1000);
        });
    }
};