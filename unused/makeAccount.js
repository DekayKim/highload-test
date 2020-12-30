module.exports = {
    logHeaders: logHeaders,
    joinCount: joinCount,
    loopCounter: loopCounter,
    battleCounter: battleCounter,
    loginUser: loginUser
}
// var a = 0;
var loginUser = 0;
var joinCountNum = 0;
var joinFailNum = 0;
var joinsuctNum = 0;

const fs = require('fs');
fs.writeFileSync('log.json', '');

function joinCount(requestParams, response, context, ee, next) {
    // console.log(response.body);
    joinCountNum++;

    if (parseInt(response.statusCode) >= 200) {
        if (response.body.indexOf('"status":1') == -1) {
            joinFailNum++;
            console.log(response.body)
        } else {
            joinsuctNum++;
        }
    }
    console.log('Join Count_total   : ' + joinCountNum);
    console.log('Join Count_success : ' + joinsuctNum);
    console.log('Join Count_fail    : ' + joinFailNum);
    return next(); // MUST be called for the scenario to continue
}

let logCnt = 0;
function logHeaders(requestParams, response, context, ee, next) {
    if (parseInt(response.statusCode) >= 500) {
        console.log('[ERR 500]', requestParams.url, response.body);
    } else if (parseInt(response.statusCode) >= 400) {
        console.log('[ERR 400]', requestParams.url, response.body);
    } else if (parseInt(response.statusCode) >= 200) {
        ;
    }
    fs.writeFileSync('log.json',
        `[${new Date().toLocaleTimeString()} ${logCnt++} ${response.statusCode} - ${context.vars.id}/${context.vars.sid}] ${requestParams.url} - ${context.vars.battleLoop}\n`,
        {
            flag: 'a',
            encoding: 'utf-8'
        }
    )
    return next(); // MUST be called for the scenario to continue
}

function loopCounter(requestParams, context, ee, next) {
    context.vars['battleLoop'] = context.vars['battleLoop'] || 0;

    context.vars['battleLoop']++;
    return next(); // MUST be called for the scenario to continue
}

function battleCounter(requestParams, context, ee, next) {
    context.vars['battleContNum'] = context.vars['battleContNum'] || 1;

    context.vars['battleContNum'] = context.vars['dungeon'][context.vars['battleLoop']]['party'].length;
    // console.log(context.vars['battleContNum'])
    return next(); // MUST be called for the scenario to continue
}


function loginUser(requestParams, response, context, ee, next) {
    loginUser++;
    console.log(`[ACC USER] ${loginUser}`);
    return next(); // MUST be called for the scenario to continue
}