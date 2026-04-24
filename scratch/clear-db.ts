import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

async function clearDb() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  
  console.log('Clearing database...');
  await dataSource.dropDatabase();
  await dataSource.synchronize();
  console.log('Database cleared and synchronized.');
  
  await app.close();
}

clearDb().catch(err => {
  console.error('Error clearing database:', err);
  process.exit(1);
});
