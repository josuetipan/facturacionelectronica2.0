import { readFile, writeFile, mkdir, rename } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Registro de factura en la base de datos
 */
export type InvoiceRecord = {
  id?: string;
  claveAcceso: string;
  estado: 'RECIBIDA' | 'DEVUELTA' | 'AUTORIZADO' | 'NO AUTORIZADO';
  xmlFirmado: string;
  xmlAutorizado?: string;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  estab: string;
  ptoEmi: string;
  secuencial: string;
  total: number;
  emailCliente?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * Interfaz del repositorio de facturas
 */
export interface InvoiceRepo {
  upsertByClave(data: InvoiceRecord): Promise<InvoiceRecord>;
  findByClave(claveAcceso: string): Promise<InvoiceRecord | null>;
  list(limit?: number): Promise<InvoiceRecord[]>;
}

/**
 * Implementación con Prisma (si está disponible)
 */
class PrismaRepo implements InvoiceRepo {
  private prisma: any;

  constructor() {
    try {
      // Intentar importar Prisma dinámicamente
      const { PrismaClient } = require('@prisma/client');
      this.prisma = new PrismaClient();
    } catch (error) {
      throw new Error('Prisma no está disponible');
    }
  }

  async upsertByClave(data: InvoiceRecord): Promise<InvoiceRecord> {
    try {
      const now = new Date();
      const record = {
        ...data,
        createdAt: data.createdAt || now,
        updatedAt: now
      };

      // Intentar upsert usando Prisma
      const result = await this.prisma.invoice.upsert({
        where: { claveAcceso: data.claveAcceso },
        update: record,
        create: record
      });

      return result;
    } catch (error) {
      console.error('Error en PrismaRepo.upsertByClave:', error);
      throw new Error(`Error al guardar factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async findByClave(claveAcceso: string): Promise<InvoiceRecord | null> {
    try {
      const result = await this.prisma.invoice.findUnique({
        where: { claveAcceso }
      });
      return result;
    } catch (error) {
      console.error('Error en PrismaRepo.findByClave:', error);
      return null;
    }
  }

  async list(limit: number = 50): Promise<InvoiceRecord[]> {
    try {
      const results = await this.prisma.invoice.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
      return results;
    } catch (error) {
      console.error('Error en PrismaRepo.list:', error);
      return [];
    }
  }
}

/**
 * Implementación con JSON como fallback
 */
class JsonRepo implements InvoiceRepo {
  private filePath: string;
  private data: InvoiceRecord[] = [];

  constructor() {
    this.filePath = path.join(process.cwd(), 'data', 'invoices.json');
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }
  }

  private async loadData(): Promise<void> {
    try {
      if (existsSync(this.filePath)) {
        const fileContent = await readFile(this.filePath, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = [];
      }
    } catch (error) {
      console.error('Error cargando datos JSON:', error);
      this.data = [];
    }
  }

  private async saveData(): Promise<void> {
    try {
      // Guardado atómico para evitar corrupción en escrituras concurrentes
      const tempPath = this.filePath + '.tmp';
      await writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      await rename(tempPath, this.filePath);
    } catch (error) {
      console.error('Error guardando datos JSON:', error);
      throw new Error('Error al guardar datos');
    }
  }

  async upsertByClave(data: InvoiceRecord): Promise<InvoiceRecord> {
    await this.loadData();
    
    const now = new Date();
    const record = {
      ...data,
      id: data.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: data.createdAt || now,
      updatedAt: now
    };

    const existingIndex = this.data.findIndex(item => item.claveAcceso === data.claveAcceso);
    
    if (existingIndex >= 0) {
      // Actualizar registro existente
      this.data[existingIndex] = record;
    } else {
      // Crear nuevo registro
      this.data.push(record);
    }

    await this.saveData();
    return record;
  }

  async findByClave(claveAcceso: string): Promise<InvoiceRecord | null> {
    await this.loadData();
    const record = this.data.find(item => item.claveAcceso === claveAcceso);
    return record || null;
  }

  async list(limit: number = 50): Promise<InvoiceRecord[]> {
    await this.loadData();
    return this.data
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }
}

/**
 * Factory para crear el repositorio apropiado
 */
export function createInvoiceRepo(): InvoiceRepo {
  try {
    // Intentar usar Prisma si está disponible
    return new PrismaRepo();
  } catch (error) {
    console.info('Prisma no disponible, usando JSON como fallback');
    return new JsonRepo();
  }
}

// Exportar instancia por defecto
export const invoiceRepo = createInvoiceRepo();
