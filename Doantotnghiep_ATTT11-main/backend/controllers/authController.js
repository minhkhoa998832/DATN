import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../models/db.js';

export const register = async (req, res) => {
  const db = getDB();
  const { username, password } = req.body;
  const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length > 0) {
    return res.status(400).send('❌ Tên đăng nhập đã tồn tại, vui lòng chọn tên khác');
  }
  const hash = await bcrypt.hash(password, 10);
  await db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, hash]);
  res.status(201).send('Đăng ký thành công');
};

export const login = async (req, res) => {
  const db = getDB();
  const { username, password } = req.body;
  const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
    return res.status(401).send('Lỗi đăng nhập: Tên đăng nhập hoặc mật khẩu không đúng');
  }
  const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, process.env.JWT_SECRET);
  res.json({ token, user: { id: rows[0].id, username: rows[0].username } });
};
