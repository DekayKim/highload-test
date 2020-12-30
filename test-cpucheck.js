const os = require('os');

// console.log(os.cpus())
let chkCnt = 0;
setInterval(() => {
    let nowCpuTimeArr = (os.cpus()).map((eachCpu) => {
        let totalCapa = Object.values(eachCpu.times).reduce((acc, val) => acc + val);
        return ((1 - eachCpu.times.idle / totalCapa) * 100); // .toFixed(1) + '%'
    })
    console.log(
        ++chkCnt,
        (os.freemem()/1000/1000/1000).toFixed(2) + 'GB',
        (nowCpuTimeArr.reduce((acc, val) => acc + val) / nowCpuTimeArr.length).toFixed(2) + '%'
    )

    if(chkCnt === 3) {
        process.exit();
    }
}, 1000)