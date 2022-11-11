import * as dotenv from 'dotenv'
dotenv.config();
let host = process.env.DB_HOST;
let db = process.env.DB_NAME;
let user = process.env.DB_USER;
let password = process.env.DB_PASSWORD;
const database = `mongodb+srv://${user}:${password}@${host}/${db}`;
export { database };