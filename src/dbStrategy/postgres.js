import pgk from "pg";
dotenv.config();

const { Pool } = pgk;

const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export default connection;