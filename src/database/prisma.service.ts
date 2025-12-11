import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('⚠️ Could not load .env:', result.error.message);
  } else if (result.parsed && Object.keys(result.parsed).length > 0) {
    console.log('✅ Pre-loaded .env, found', Object.keys(result.parsed).length, 'variables');
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService?: ConfigService) {
    let databaseUrl = 
      configService?.get<string>('DATABASE_URL') || 
      process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      const result = dotenv.config({ path: envPath });
      databaseUrl = result.parsed?.DATABASE_URL || process.env.DATABASE_URL;
    }
    
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL is not defined. Please check your .env file at: ' + envPath
      );
    }

    process.env.DATABASE_URL = databaseUrl;
    console.log('✅ DATABASE_URL configured, length:', databaseUrl.length);

    const pool = new Pool({
      connectionString: databaseUrl,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter: adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

