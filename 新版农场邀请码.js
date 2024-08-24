const {
    api, getEnvs,
    sleep, clearProxy
} = require('./quantum');
const { universal } = require('./h5st')
let cookies = [];
const fs = require('fs');
const moment = require('moment');


!(async () => {
    let time = moment().format("YYYYMMDD");
    filePath = time + ".txt";
    let txt = "";
    await fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') { // 如果文件不存在
                console.log('文件不存在，将自动创建新文件。');
                // 写入新文件
                fs.writeFile(filePath, '-', (err) => {
                    if (err) {
                        console.error('创建新文件时发生错误:', err);
                        return;
                    }
                    console.log('新文件已成功创建并写入内容。');
                });
            } else {
                console.error('读取文件时发生错误:', err);
            }
            return;
        }
        txt = data;
    });

    let isQuantum = process.env.QuantumAssistantTemporaryToken && process.env.QuantumAssistantTemporaryToken.length > 0;
    // let envs = await getEnvs("JD_COOKIE", null, null);
    // for (var i = 0; i < envs.length; i++) {
    //     let e = envs[i];
    //     if (!e.Enable) {
    //         continue;
    //     }
    //     cookies.push(e.Value);
    // }
    if (isQuantum) {
        let pins = [
            "18690725682_p",
            // 'jd_GdXLyliTnmXH',
            'jd_4b992df9995e1',
            'jd_aDlznDhaQHRc',
            'jd_631777869a6bb'
        ]
        let envs = await getEnvs("JD_COOKIE", null, null);
        for (var i = 0; i < envs.length; i++) {
            let e = envs[i];
            if (!e.Enable) {
                continue;
            }

            let pt_pin = e.Value.match(/pin=([^; ]+)(?=;?)/)[1];
            if (txt.indexOf(pt_pin) > -1) {
                continue;
            }

            for (var x = 0; x < pins.length; x++) {
                if (e.Value.indexOf(pins[x]) > 2) {
                    cookies.push(e.Value);
                    break;
                }
            }
        }
    } else {
        const fs = require('fs');
        try {
            const data = fs.readFileSync('cookies.txt', 'utf8');
            cookies = data.split("\r\n");;
        } catch (err) {
            console.error(err);
        }
    }
    console.log("开始获取新办农场邀请码，共计Cookie数量：" + cookies.length);
    let x2 = 0;
    for (let c = 0; c < cookies.length; c++) {
        let cookie = cookies[c];
        x2 = 0;
        do {
            try {
                let code = await farm_home(cookie);
                console.log(`[${cookie}]获取邀请码：【${code}】。`)
                let msg = `/Bc9WX7MpCW7nW9QjZ5N3fFeJXMH/index.html?inviteCode=${code}&`;
                let pt_pin = cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]
                txt += pt_pin + "||";
                fs.writeFile(filePath, txt, (err) => {
                    if (err) {
                        console.error('写入文件时发生错误:', err);
                    }
                    console.log('文件已成功写入');
                });
                post("hmq394047464", msg, pt_pin)
                break;
            } catch (e) {
                x2++;
                console.log(`[${cookie}]获取邀请码失败，骚后重试。。。` + x2)
                console.log(e)
            }
            await sleep(10 * 1000);
        } while (x2 < 2)
    }
})().catch((e) => {
    console.log("脚本异常：" + e);
});

async function farm_home(cookie) {
    var hdata = await universal("farm_home",
        {
            "version": 3
        }, {
        "appid": "signed_wh5",
        "appId": "c57f6",
        "version": "4.7"
    });
    let config = {
        method: 'post',
        url: 'https://h5.m.jd.com/client.action',
        headers: {
            'Host': 'api.m.jd.com',
            'User-Agent': hdata.ua,
            'accept': 'application/json, text/plain, */*',
            'Origin': 'https://h5.m.jd.com',
            'X-Requested-With': 'com.jingdong.app.mall',
            'Sec-Fetch-Site': 'same-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://h5.m.jd.com/',
            'Cookie': cookie,
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: hdata.data
    };
    let result = await api(config).json()
    if (result.code === 405) {
        clearProxy();
        throw new Error(JSON.stringify(result));
    } else {
        return result.data.result.farmHomeShare.inviteCode;
    }
}

function post(wxid, msg, name) {
    console.log(msg)
    let data = JSON.stringify({
        "sdkVer": 5,
        "Event": "EventPrivateChat",
        "content": {
            "robot_wxid": "wxid_rz5uoe66i98i22",
            "type": 1,
            "from_wxid": wxid,
            "from_name": name,
            "msg": msg,
            "clientid": 0,
            "robot_type": 0,
            "msg_id": "-1"
        }
    });
    let config = {
        method: 'post',
        url: process.env.QuantumOrderService + '/api/vlw/dic8emf0g8mb3cAJU',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    };
    api(config)
        .then(function (response) {
            console.log(response.body);
        })
        .catch(function (error) {
            console.log(error);
        });
}
