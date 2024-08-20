import { MorganMiddleware } from '@nest-middlewares/morgan';

export const defaultMorganFn: Parameters<
  typeof MorganMiddleware.configure
>[0] = (tokens, req, res) =>
  [
    tokens.method(req, res),
    tokens.url(req, res),
    req.headers['authorization']
      ? `${req.headers['authorization'].slice(0, 10)}...`
      : '',
    `->`,
    tokens.status(req, res),
    `(${tokens['response-time'](req, res)} ms)`,
  ]
    .filter((_) => _)
    .join(' ');
