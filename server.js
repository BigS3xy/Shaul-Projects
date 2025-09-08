const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'teimotOlam'
};


app.get('/meals', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM meals');
    res.json(rows);
  } catch (err) {
    console.error('שגיאה בשליפה:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/toggle-discount', async (req, res) => {
  const { id } = req.body;
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM meals WHERE id = ?', [id]);
    const meal = rows[0];

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    let newPrice = meal.original_price;
    let discounted = 0;

    if (!meal.is_discounted) {
      switch (meal.id) {
        case 1:
          newPrice = meal.original_price * 0.5;
          break;
        case 2:
          newPrice = meal.original_price - 15;
          break;
        case 3:
          newPrice = meal.original_price * 0.8;
          break;
      }
      discounted = 1;
    }

    await conn.execute(
      'UPDATE meals SET price = ?, is_discounted = ? WHERE id = ?',
      [newPrice, discounted, id]
    );

    res.send('Discount updated');
  } catch (err) {
    console.error('שגיאה בעדכון הנחה:', err);
    res.status(500).json({ error: err.message });
  }
});

const path = require('path');

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'italianMenu.html'));
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
