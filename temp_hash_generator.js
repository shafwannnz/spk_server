const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

// Using a common password for all dummy users for simplicity
const password = 'password123';
hashPassword(password);
