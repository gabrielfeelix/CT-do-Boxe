const { Client } = require('pg');
const client = new Client('postgresql://postgres:Gafe362215.@db.reqhddvgquiomxvqvcdn.supabase.co:5432/postgres');
client.connect().then(() => client.query("NOTIFY pgrst, 'reload schema';")).then(() => { console.log('Reloaded'); client.end(); });
