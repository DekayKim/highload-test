const perf = require('../../checkPerformance.js');
const request = require('request-promise-native');

const ACTOR_DUMMY = require('../../dummy_data.json');
const dungeonLimit = 10;

module.exports = function battle(eachSeq) {
    return new Promise(async function (resolve, reject) {
        let eachUserData = perf.userData[eachSeq];

        for (eachUserData.nowDungeonNo = 1; eachUserData.nowDungeonNo <= dungeonLimit; eachUserData.nowDungeonNo++) {
            let dungeonNo = eachUserData.nowDungeonNo;
            await perf.callReq(`/battle/dungeon_start/${dungeonNo}/1`, eachSeq, {
                form: {
                    sid: eachUserData.sid
                }
            }, true);
            await perf.callReq('/get/quest_list', eachSeq, {
                form: {
                    sid: eachUserData.sid
                }
            }, true);

            let battleCapa = eachUserData.dungeon[dungeonNo].party.length;
            for (let nowBattleNo = 1; nowBattleNo <= battleCapa; nowBattleNo++) {
                await perf.callReq('/battle/dungeon_battle_start', eachSeq, {
                    form: {
                        sid: eachUserData.sid
                    }
                }, true);
                await perf.sleep(7 + Math.round(Math.random() * 3));
                await perf.callReq('/battle/dungeon_battle_end', eachSeq, {
                    form: {
                        sid: eachUserData.sid,
                        command: {},
                        actor: ACTOR_DUMMY,
                        win: 1
                    }
                }, true);
            }
            await perf.callReq('/battle/dungeon_end', eachSeq, {
                form: {
                    sid: eachUserData.sid,
                    drop: "%5B%5D"
                }
            }, true);
            await perf.callReq('/get/user_data', eachSeq, {
                form: {
                    sid: eachUserData.sid
                }
            }, true);
            await perf.sleep(1 + Math.round(Math.random() * 2));
        }

        perf.after(eachUserData);
        return resolve(true);
    });
}