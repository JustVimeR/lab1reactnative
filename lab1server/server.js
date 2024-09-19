const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const dataFilePath = './encryptedData.json';

if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

const getEncryptedData = () => {
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
};

const saveEncryptedData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

app.post('/save', (req, res) => {
  const { text, method, key } = req.body;
  
  const data = getEncryptedData();
  const newEntry = { text, method, key };
  data.push(newEntry);
  
  saveEncryptedData(data);
  res.send({ message: 'Зашифрований текст збережено' });
});

app.post('/decrypt', (req, res) => {
  const { text, method, key } = req.body;
  
  const data = getEncryptedData();
  const found = data.find(entry => entry.text === text && entry.method === method && entry.key === key);
  
  if (found) {
    return res.send({ message: 'Текст знайдено', decrypted: true });
  } else {
    return res.status(404).send({ message: 'Текст не знайдено в базі', decrypted: false });
  }
});

app.get('/data', (req, res) => {
  const data = getEncryptedData();
  res.json(data);
});

app.delete('/delete', (req, res) => {
  const { text, method, key } = req.body;

  let data = getEncryptedData();
  const initialLength = data.length;

  data = data.filter(entry => !(entry.text === text && entry.method === method && entry.key === key));

  if (data.length === initialLength) {
    return res.status(404).send({ message: 'Текст не знайдено для видалення' });
  }

  saveEncryptedData(data);
  res.send({ message: 'Текст успішно видалено' });
});


// Запуск сервера
app.listen(3000, () => {
  console.log('Сервер запущено на порті 3000');
});
