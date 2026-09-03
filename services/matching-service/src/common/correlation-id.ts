import { randomUUID } from 'node:crypto';

const acceptedCorrelationId = /^[A-Za-z0-9._:-]{1,128}$/;

export function resolveCorrelationId(value: string | undefined): string {
  return value && acceptedCorrelationId.test(value) ? value : randomUUID();
}
