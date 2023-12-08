// server.js
import express from 'express';
import { writeFile } from 'fs';
import cors from 'cors';
import http from 'http'; // 使用http模块，因为目标URL是http协议

const app = express();
app.use(express.json());
app.use(cors());

app.post('/save-json', (req, res) => {
  const { qqNumber, ...dataToSave } = req.body;
  const filePath = `${qqNumber}.json`;
  const targetUrl = `http://alin.highmore.tk:11451/unban?qq=${qqNumber}`;
  console.log(qqNumber);
  // 先发起GET请求
  http.get(targetUrl, (response) => { // 这里添加了 response 参数
    let responseData = '';
    // 接收数据
    response.on('data', (chunk) => {
      responseData += chunk;
    });
    // 请求结束
    response.on('end', () => {
      // 在GET请求成功后写入文件
      writeFile(filePath, JSON.stringify(dataToSave, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ message: 'Error saving the file' });
        }
        // 文件写入成功后，将GET请求的响应发送回客户端
        res.send({ message: 'File saved successfully', unbanResponse: responseData });
      });
    });
  }).on('error', (err) => {
    // GET请求错误处理
    console.error('Error: ', err);
    res.status(500).send('An error occurred while trying to proxy the unban request');
  });
});

const PORT = 6000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running on port ${PORT}`);
});
