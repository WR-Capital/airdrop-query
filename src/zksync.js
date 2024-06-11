import axios from 'axios-https-proxy-fix';
import fs from 'fs';
import csv from 'csv-parser';
import * as csvStringify from 'csv-stringify';
import { PROXY, MAXRETRY, ZKWALLETPATH, OUTPUTPATH } from '../config.json.js';
import { fileURLToPath } from 'url';
import { parse } from 'path';
import Logger from "@youpaichris/logger";
import { randomInt } from 'crypto';
import { csvToArray, appendToCsv, sleep } from './utils.js';
const logger = new Logger();

const __filename = fileURLToPath(import.meta.url);
const parsedPath = parse(__filename);
const filename = parsedPath.name;
const outputPath = `${OUTPUTPATH}/${filename}QueryData.csv`;
const headers = {
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'X-Api-Key': '46001d8f026d4a5bb85b33530120cd38'
}
const request = axios.create({ headers, PROXY, timeout: 10000 });


async function queryzkSyncAirdrop(walletAddress) {
    const url = `https://api.zknation.io/eligibility?id=${walletAddress}`;
    try {
        const res = await request.get(url);
        if (res.data && res.data.allocations && res.data.allocations[0] && typeof res.data.allocations[0].tokenAmount) {
            const amount = Number(res.data.allocations[0].tokenAmount) / 10 ** 18;
            return { state: 'sucess', address: walletAddress, amount: amount };
        } else {
            return { state: 'sucess', address: walletAddress, amount: 0 };
        }
    } catch (error) {
        return { state: 'error', address: walletAddress, amount: 0 };
    }
};


; (async () => {
    let airDropDatas = [];
    const dataProcessingPromises = [];


    const wallet = await csvToArray(ZKWALLETPATH)
    console.log(wallet)

    for (const row of wallet) {

        const walletAddress = row['Address'];
        const walletName = row['Wallet'];
        let retry = 0;
        let res = null;
        let airDropData = {};
        while (retry < MAXRETRY) {
            await sleep(randomInt(1, 4));
            res = await queryzkSyncAirdrop(walletAddress);
            if (res.state === 'sucess') {
                airDropData = { walletName, walletAddress, amount: res.amount };
                // 暂停1-3秒
                break;
            }
            retry++;
        }
        if (retry === MAXRETRY) {
            airDropData = { walletName, walletAddress, amount: 'error' };
        }
        logger.success(airDropData);
        await appendToCsv(airDropData, outputPath)
        await new Promise(resolve => setTimeout(resolve, randomInt(1000, 3000)));
    }

    
    logger.info(`所有地址查询完毕，结果保存在: ${outputPath}`);

})();