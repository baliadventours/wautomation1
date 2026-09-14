import crypto from 'crypto';
import { DispatchJob } from '../src/types';
import { db } from './db';

export interface QueueJobPayload {
  tenantId: string;
  recipient: string;
  type: 'text' | 'media' | 'location' | 'voucher';
  summary: string;
  details?: {
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'document' | 'audio';
    fileName?: string;
    caption?: string;
    location?: {
      latitude: number;
      longitude: number;
      title: string;
      address?: string;
    };
    bookingId?: string;
  };
  customDelayMs?: number;
}

export class MessageQueueService {
  private queue: Array<DispatchJob & { payload?: any }> = [];
  private isProcessing: boolean = false;
  private minDelayMs: number = 2200; // Base delay for anti-ban compliance

  constructor() {
    // Restore any un-delivered jobs from db
    const saved = db.getDispatchJobs().filter((j) => j.status === 'queued' || j.status === 'processing');
    this.queue = saved.map((s) => ({ ...s }));
    if (this.queue.length > 0) {
      this.triggerProcessing();
    }
  }

  public enqueue(payload: QueueJobPayload): DispatchJob {
    const jitterMs = Math.floor(350 + Math.random() * 650); // 350ms - 1000ms randomized human jitter
    const delayMs = (payload.customDelayMs || this.minDelayMs) + jitterMs;

    const job: DispatchJob & { payload?: any } = {
      id: `job_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      tenantId: payload.tenantId,
      recipient: payload.recipient,
      type: payload.type,
      summary: payload.summary,
      status: 'queued',
      enqueuedAt: new Date().toISOString(),
      delayMs,
      jitterMs,
      payload: payload.details,
    };

    this.queue.push(job);
    db.addDispatchJob({
      id: job.id,
      tenantId: job.tenantId,
      recipient: job.recipient,
      type: job.type,
      summary: job.summary,
      status: job.status,
      enqueuedAt: job.enqueuedAt,
      delayMs: job.delayMs,
      jitterMs: job.jitterMs,
    });

    this.triggerProcessing();
    return job;
  }

  public getStats() {
    const all = db.getDispatchJobs();
    const queued = this.queue.filter((j) => j.status === 'queued').length;
    const processing = this.queue.filter((j) => j.status === 'processing').length;
    const delivered = all.filter((j) => j.status === 'delivered').length;
    const failed = all.filter((j) => j.status === 'failed').length;

    return {
      activeQueueLength: this.queue.length,
      queued,
      processing,
      delivered,
      failed,
      baseDelayMs: this.minDelayMs,
      averageJitterMs: 500,
      workerActive: this.isProcessing,
    };
  }

  public getRecentJobs(limit: number = 20): DispatchJob[] {
    return db.getDispatchJobs().slice(0, limit);
  }

  public clearQueue() {
    this.queue = [];
    return { success: true, message: 'Queue drained' };
  }

  private async triggerProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const current = this.queue[0];
      current.status = 'processing';
      db.updateDispatchJob(current.id, { status: 'processing' });

      // Simulate human typing & anti-ban cadence delay
      const waitTime = current.delayMs || 2500;
      await new Promise((res) => setTimeout(res, Math.min(waitTime, 2800)));

      // Mark delivered
      current.status = 'delivered';
      current.deliveredAt = new Date().toISOString();
      db.updateDispatchJob(current.id, {
        status: 'delivered',
        deliveredAt: current.deliveredAt,
      });

      // Remove from active queue
      this.queue.shift();
    }

    this.isProcessing = false;
  }
}

export const messageQueue = new MessageQueueService();
