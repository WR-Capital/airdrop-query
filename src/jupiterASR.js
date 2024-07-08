import axios from 'axios-https-proxy-fix';
import fs from 'fs';
import csv from 'csv-parser';
import * as csvStringify from 'csv-stringify';
import { PROXY, MAXRETRY, JUPWALLETPATH, JUPTOKENMINT, OUTPUTPATH, SOLRPC } from '../config.json.js';
import { Connection, PublicKey } from '@solana/web3.js';
import { fileURLToPath } from 'url';
import { parse } from 'path';
import Logger from "@youpaichris/logger";
import { randomInt } from 'crypto';
import { getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
const logger = new Logger();

const __filename = fileURLToPath(import.meta.url);
const parsedPath = parse(__filename);
const filename = parsedPath.name;
const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
}
const request = axios.create({ headers, PROXY, timeout: 10000 });

const tokenSymbolInfo = {
    'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk': { symbol: 'WEN' },
    'ZEUS1aR7aX8DFFJf5QjWj2ftDDdNTroMNGo8YoQm3Gq': { symbol: 'ZEUS' },
    'SHARKSYJjqaNyxVfrpnBN9pjgkhwDhatnMyicWPnr1s': { symbol: 'SHARK' },
    'UPTx1d24aBWuRgwxVnFmX4gNraj3QGFzL3QqBgxtWQG': { symbol: 'UPT' },
    'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP' },
}

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

for (const key in tokenSymbolInfo) {
    const mintPublicKey = new PublicKey(key);
    const mintInfo = await getMint(connection, mintPublicKey);
    tokenSymbolInfo[key] = {...tokenSymbolInfo[key], ...mintInfo};

}

async function queryJupterASRAirdrop(walletAddress) {

    const url = `https://worker.jup.ag/jup-asr-july-2024-claim-proof/${walletAddress}`;

    try {
        const res = await request.get(url);
        const data = res.data;
        if (typeof res.data === 'object' && res.data.claim.length > 0) {

            const amountInfo = {};
            for (const item of data.claim) {
                const mint = item.mint;
                const amount = item.amount / Math.pow(10, tokenSymbolInfo[mint]['decimals']);
                amountInfo[tokenSymbolInfo[mint].symbol] = amount;
            }
            return { state: 'sucess', address: walletAddress, voteCount: data.voteCount, ...amountInfo };

        } else {
            return { state: 'sucess', address: walletAddress, voteCount: data.voteCoun };
        }
    } catch (error) {
        return { state: 'error', address: walletAddress };
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
                    await new Promise(resolve => setTimeout(resolve, randomInt(1000, 5000)));
                    res = await queryJupterASRAirdrop(walletAddress);
                    if (res.state === 'sucess') {
                        airDropData = { ...res };
                        break;
                    }
                    retry++;
                }
                if (retry === MAXRETRY) {
                    airDropData = { walletName, walletAddress };
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