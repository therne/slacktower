import { ValidateError as TsoaValidateError } from '@tsoa/runtime';
import { Middleware } from 'koa';
import { assignWithoutNull } from '~/utils';

export const ROUTE_NOT_FOUND = 'route not found';

export class ErrorWithHttpStatus extends Error {
  /** HTTP status code. */
  status: number;

  /** extra fields given on error object. */
  payload: object;

  /** Only displayed on development environment. */
  details?: string;

  constructor(status: number, message: string, payload: object = {}, details?: string) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.details = details;
  }
}

export class ValidationError extends ErrorWithHttpStatus {
  constructor(message = 'invalid request', details?: string, payload = {}) {
    super(400, message, payload, details);
  }
}

export class NotFoundError extends ErrorWithHttpStatus {
  constructor(message = 'not found', payload = {}) {
    super(404, message, payload);
  }
}

export function errorHandler(verbose: boolean): Middleware {
  return async (ctx, next) => {
    try {
      await next();
      if (ctx.status === 404) {
        ctx.body = { error: { message: ROUTE_NOT_FOUND } };
        ctx.status = 404;
      }
    } catch (err) {
      const { status, body } = createErrorResponse(err as Error, verbose);
      ctx.body = body;
      ctx.status = status;
    }
  };
}

export function createErrorResponse(err: Error, verbose: boolean): { status: number; body: object } {
  const message = err.message ?? err.constructor.name;
  const stack = err.stack ? prettifyStack(err.stack) : undefined;

  if (err instanceof TsoaValidateError) {
    return {
      status: 400,
      body: {
        error: {
          message,
          validation: err.fields,
        },
      },
    };
  }

  const { status, payload, details } = err as ErrorWithHttpStatus;
  const error = assignWithoutNull({ message, details }, payload ?? {}, verbose ? { stack } : {});

  return {
    status: status ?? 500,
    body: { error },
  };
}

const prettifyStack = (stack: string) =>
  stack
    .split('\n')
    .map((line) => line.replace('at', '').trim())
    .map((line) => line.replace(process.cwd(), '.'))
    .slice(1);
