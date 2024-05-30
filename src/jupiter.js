import axios from 'axios-https-proxy-fix';
import fs from 'fs';
import csv from 'csv-parser';
import * as csvStringify from 'csv-stringify';
import { PROXY, MAXRETRY, JUPWALLETPATH, JUPTOKENMINT, OUTPUTPATH } from '../config.json.js';
import { fileURLToPath } from 'url';
import { parse } from 'path';
import Logger from "@youpaichris/logger";

const logger = new Logger();

const __filename = fileURLToPath(import.meta.url);
const parsedPath = parse(__filename);
const filename = parsedPath.name;
const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
}
const request = axios.create({ headers, PROXY, timeout: 10000 });


async function queryJupterAirdrop(tokenMint, walletAddress) {
    const url = `https://worker.jup.ag/jup-claim-proof/${tokenMint}/${walletAddress}`;
    try {
        const res = await request.get(url);
        if (typeof res.data === 'object' && res.data !== null && 'amount' in res.data) {
            return { state: 'sucess', address: walletAddress, amount: res.data.amount };
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

    fs.createReadStream(JUPWALLETPATH)
        .pipe(csv())
        .on('data', (row) => {
            dataProcessingPromises.push((async () => {
                const walletAddress = row['Address'];
                const walletName = row['Wallet'];
                let retry = 0;
                let res = null;
                let airDropData = {};
                while (retry < MAXRETRY) {
                    res = await queryJupterAirdrop(JUPTOKENMINT, walletAddress);
                    if (res.state === 'sucess') {
                        airDropData = { walletName, walletAddress, amount: res.amount };
                        break;
                    }
                    retry++;
                }
                if (retry === MAXRETRY) {
                    airDropData = { walletName, walletAddress, amount: 'error' };
                }
                logger.success(airDropData);
                airDropDatas.push(airDropData);
            })());
        })
        .on('end', async () => {
            await Promise.all(dataProcessingPromises);
            csvStringify.stringify(airDropDatas, { header: true }, (err, output) => {
                if (err) throw err;
                fs.writeFile(`${OUTPUTPATH}/${filename}QueryData.csv`, output, (err) => {
                    if (err) throw err;
                    logger.info(`查询完毕，结果保存在: data/output/${filename}QueryData.csv`);
                });
            });
        });
})();