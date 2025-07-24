// data-source.ts
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['dist/apps/weather-app/src//**/*.entity.js'],
  migrations: ['dist/apps/weather-app/src/migrations/*.js'],
  synchronize: false,
});
