import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);

// ----------------基础配置----------------
// --------路径配置--------
export const ROOTPATH = dirname(__filename); // 代码根目录
export const DATAPATH = ROOTPATH + '/data'; // DATA目录
export const OUTPUTPATH = DATAPATH + '/output'; // OUTPUT目录

// --------最大重试次数--------
export const MAXRETRY = 3;


// ----------------RPC配置----------------
export const SOLRPC = 'https://api.mainnet-beta.solana.com'; // SOL RPC地址

// --------代理配置,不使用代理这里留空--------
export const PROXY = {
    host: '85.239.53.78',
    port: 33000,
    auth: {
        username: 'wrtest66781-sess_8zix1690gxdp_1+hk',
        password: 'AsdBBcDtRERy'
    }
};

// ----------------空投查询配置----------------

// --------Jupiter空投查询配置--------
export const JUPWALLETPATH = '/Users/lishuai/Documents/crypto/bockchainbot/SOLTestWalle加密.csv'; // Jup空投钱包路径
export const JUPTOKENMINT = 'UPTx1d24aBWuRgwxVnFmX4gNraj3QGFzL3QqBgxtWQG'; // JUP要查询的token合约地址,在空投查询页面可以找到

// --------ZKSYNC空投查询配置--------
export const ZKWALLETPATH = '/Users/lishuai/Downloads/脚本钱包地址.csv'; // Jup空投钱包路径

// --------LAYZERO空投查询配置--------
export const LAYZEROWALLETPATH = '/Volumes/s1.s100.vip/小号专用/撸毛/帅总300L0.csv'; // 空投钱包路径