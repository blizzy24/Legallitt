import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createDatabaseClient } from "./database";
import { PrismaClient } from "./generated/prisma/client";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private client?: Promise<PrismaClient>;

  // No database or AWS connection is made by a liveness request.
  getClient(): Promise<PrismaClient> {
    if (!this.client) {
      this.client = createDatabaseClient().catch((error: unknown) => {
        this.client = undefined;
        throw error;
      });
    }
    return this.client;
  }

  async onModuleDestroy() {
    if (this.client) await (await this.client).$disconnect();
  }
}
