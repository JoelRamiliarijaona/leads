import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Charger .env AVANT que la classe ne soit définie pour que PrismaClient puisse le lire
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
    // S'assurer que DATABASE_URL est disponible
    let databaseUrl = 
      configService?.get<string>('DATABASE_URL') || 
      process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      // Dernière tentative : charger depuis .env
      const result = dotenv.config({ path: envPath });
      databaseUrl = result.parsed?.DATABASE_URL || process.env.DATABASE_URL;
    }
    
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL is not defined. Please check your .env file at: ' + envPath
      );
    }

    // S'assurer que DATABASE_URL est dans process.env
    process.env.DATABASE_URL = databaseUrl;
    console.log('✅ DATABASE_URL configured, length:', databaseUrl.length);

    // Prisma 7 nécessite un adapter PostgreSQL
    // Créer un pool de connexions PostgreSQL
    const pool = new Pool({
      connectionString: databaseUrl,
    });

    // Créer l'adapter Prisma pour PostgreSQL
    const adapter = new PrismaPg(pool);

    // Prisma 7 : passer l'adapter au constructeur
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

