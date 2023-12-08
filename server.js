// server.js
import express from 'express';
import { writeFile, mkdir } from 'fs';
import cors from 'cors';
import http from 'http'; // 使用http模块，因为目标URL是http协议
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json());
app.use(cors());

const __dirname = dirname(fileURLToPath(import.meta.url));

app.post('/save-json', (req, res) => {
  const { qqNumber, ...dataToSave } = req.body;
  const dirPath = `${__dirname}/userdata`;
  const filePath = `${dirPath}/${qqNumber}.json`;
  const targetUrl = `机器人ip:端口/unban?qq=${qqNumber}`;
  console.log(qqNumber)

  // 确保目录存在
  mkdir(dirPath, { recursive: true }, (dirErr) => {
    if (dirErr) {
      console.error(dirErr);
      return res.status(500).send({ message: 'Error creating the directory' });
    }

    // 先发起GET请求
    http.get(targetUrl, (response) => {
      let responseData = '';
      response.on('data', (chunk) => {
        responseData += chunk;
      });
      response.on('end', () => {
        writeFile(filePath, JSON.stringify(dataToSave, null, 2), (writeErr) => {
          if (writeErr) {
            console.error(writeErr);
            return res.status(500).send({ message: 'Error saving the file' });
          }
          res.send({ message: 'File saved successfully', unbanResponse: responseData });
        });
      });
    }).on('error', (httpErr) => {
      console.error('Error: ', httpErr);
      res.status(500).send('An error occurred while trying to proxy the unban request');
    });
  });
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
