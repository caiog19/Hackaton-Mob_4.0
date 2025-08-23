const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const SALT_ROUNDS = 10;

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'email already registered' });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, passwordHash, phone });

    const { passwordHash: _, ...userSafe } = user.toJSON();
    res.status(201).json({ user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) return res.status(401).json({ error: 'invalid credentials' });

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const { passwordHash: _, ...userSafe } = user.toJSON();
    res.json({ token, user: userSafe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
}

module.exports = { register, login };
