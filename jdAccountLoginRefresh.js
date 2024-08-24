/**
 * 京东账号密码登录刷新
 * 如账号过期，或超过12小时未登录刷新则自动登录
 */
const {
    sendNotify,
    getCustomData,
    getEnvs,
} = require("./quantum");

const { doCheck, login, customDataType } = require('./jdAccountLogin_base');

const moment = require('moment');

/**
 * 强制自动登录刷新时间间隔（小时）
 * 即便ck没有失效，超过这个时间也会自动登录
 */
const refrenshInterval = 8;

!(async () => {
    let customDatas = await getCustomData(customDataType, null, null, { Data7: "是" });
    for (let x = 0; x < customDatas.length; x++) {
        const cdata = customDatas[x];
        const envs = await getEnvs("JD_COOKIE", cdata.Data6, 2)
        console.log(`开始处理PIN：【${cdata.Data6}】，获取环境变量【${envs.length}】个`)
        if (!envs || envs.length <= 0 || !envs[0].Enable || moment(envs[0].UpdateTime) < moment().add(-refrenshInterval, "hours")) {
            console.log(`环境变量失效或更新时间超过[${refrenshInterval}]小时，开始自动登录获取ck`);
            process.env.user_id = cdata.Data1
            const result = await login(cdata.Data4, cdata.Data5, true)
            await doCheck(result.uid, true);
        }else{
            console.log("未达成自动登录条件，跳过。。。。")
        }
    }

})().catch(e => {

    console.error("出现错误:", e);
});
