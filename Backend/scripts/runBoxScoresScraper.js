const { spawn } = require('child_process');
const path = require('path');
const moment = require('moment');

console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Starting NBA box scores scraper...`);

const scriptPath = path.join(__dirname, '../dataControl/playersBoxScores.py');

const pythonProcess = spawn('python', [scriptPath]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ERROR: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Box scores scraper process exited with code ${code}`);
});