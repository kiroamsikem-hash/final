const { Pool } = require('./node_modules/pg');
const p = new Pool({
  connectionString: 'postgresql://admin:Kivi2020-@db.anatoliarchieve.info:6432/ana_veritabani',
  ssl: { rejectUnauthorized: false }
});
p.query('SELECT 1').then(r => {
  console.log('CONNECTED OK');
  process.exit(0);
}).catch(e => {
  console.log('FAILED:', e.message);
  process.exit(1);
});
