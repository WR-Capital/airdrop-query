import fs, { existsSync } from 'fs';
import csv from 'fast-csv';

export async function csvToArray(filePath) {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv.parse({ headers: true }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

export async function arrayToCsv(data, filePath) {
    return new Promise((resolve, reject) => {
        const csvStream = csv.format({ headers: true });
        const writableStream = fs.createWriteStream(filePath);

        writableStream.on('finish', resolve);
        writableStream.on('error', reject);

        csvStream.pipe(writableStream);
        data.forEach(item => csvStream.write(item));
        csvStream.end();
    });
}

// 将单个对象追加到 CSV 文件
export async function appendToCsv(obj, outputPath) {
    // Check if the file already exists. If not, write headers.
    if (!existsSync(outputPath)) {
        const headers = Object.keys(obj).filter(key => key !== 'wallet').join(',');
        fs.writeFileSync(outputPath, headers + '\n', 'utf8');
    }
    const values = Object.values(obj).map(value => `"${value}"`).join(',');
    const csvRow = `${values}\n`;
    fs.appendFileSync(outputPath, csvRow, 'utf8');
};

// 暂停函数
export const sleep = (minutes) => {
    const milliseconds = minutes * 1000;
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
