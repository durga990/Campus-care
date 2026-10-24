import 'dotenv/config';
import readline from 'readline';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import { registerSchema } from '../validations/schemas.js';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
let muted = false;
const origWrite = rl._writeToOutput.bind(rl);
rl._writeToOutput = (s) => { if (!muted || s.includes('\n') || s.includes('\r')) origWrite(s); else origWrite('*'); };
const ask = (q, mute = false) => new Promise((r) => { process.stdout.write(q); muted = mute; rl.question('', (a) => { muted = false; if (mute) console.log(); r(a.trim()); }); });

try {
  await connectDB();
  const name = await ask('Admin name: ');
  const email = (await ask('Admin email: ')).toLowerCase();
  const password = await ask('Password (min 8 chars, letter + number): ', true);
  const confirm = await ask('Confirm password: ', true);
  if (password !== confirm) throw new Error('Passwords do not match.');
  registerSchema.shape.name.parse(name); registerSchema.shape.email.parse(email); registerSchema.shape.password.parse(password);
  if (await User.exists({ email })) throw new Error('A user with this email already exists.');
  await User.create({ name, email, password, role: 'admin' });
  console.log(`Admin created: ${email}`);
} catch (e) {
  console.error('Failed:', e.errors?.[0]?.message || e.issues?.[0]?.message || e.message);
  process.exitCode = 1;
} finally { rl.close(); await closeDB(); }
