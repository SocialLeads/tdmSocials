import * as winston from 'winston';
import { requestContext } from '../context/request-context';

const contextEnricher = winston.format((info) => {
  const ctx = requestContext.getStore();
  if (ctx) {
    info.traceId = ctx.traceId;
    info.userId = ctx.userId;
    info.channel = ctx.channel;
  }
  return info;
});

// ---------- helpers ----------
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '');

const padRight = (s: string, width: number) => {
  const plain = stripAnsi(s);
  if (plain.length >= width) return s.slice(0, width);
  return s + ' '.repeat(width - plain.length);
};

const padLeft = (s: string, width: number) => {
  const plain = stripAnsi(s);
  if (plain.length >= width) return s.slice(0, width);
  return ' '.repeat(width - plain.length) + s;
};

const colorLevel = (levelUpper: string) => {
  // Basic ANSI colors (works everywhere)
  switch (levelUpper) {
    case 'ERROR': return `\x1b[31m${levelUpper}\x1b[0m`; // red
    case 'WARN':  return `\x1b[33m${levelUpper}\x1b[0m`; // yellow
    case 'INFO':  return `\x1b[32m${levelUpper}\x1b[0m`; // green
    case 'DEBUG': return `\x1b[36m${levelUpper}\x1b[0m`; // cyan
    case 'VERBOSE': return `\x1b[35m${levelUpper}\x1b[0m`; // magenta
    default: return levelUpper;
  }
};

const colorChannel = (channel: string) => {
  switch (channel) {
    case 'WHATSAPP': return `\x1b[35m${channel}\x1b[0m`; // purple
    case 'WEB_APP':  return `\x1b[36m${channel}\x1b[0m`; // cyan
    case 'HTTP':     return `\x1b[33m${channel}\x1b[0m`; // yellow
    default: return channel;
  }
};

// ---------- aligned console formatter ----------
const alignedConsole = winston.format.printf((info) => {
  const app = 'TDM';

  const trace = info.traceId ? String(info.traceId).slice(0, 8) : '-';
  const ts = info.timestamp; // ISO is best for alignment

  const levelUpper = String(info.level).toUpperCase();
  const levelColored = colorLevel(levelUpper);

  const channelRaw = info.channel ? String(info.channel) : '-';
  const channelColored = colorChannel(channelRaw);

  const ctx = info.context ? String(info.context) : 'MainApp';

  // ---- column widths (tweak to taste) ----
  const APP_W = 3;        // "TDM"
  const TRACE_W = 8;      // 8-char trace
  const LEVEL_W = 7;      // "INFO" / "DEBUG" + padding
  const CHANNEL_W = 9;    // "WHATSAPP" / "WEB_APP"
  const CTX_W = 18;       // "ChatController" etc.

  const colApp = padRight(app, APP_W);
  const colTrace = padRight(trace, TRACE_W);
  const colLevel = padRight(levelColored, LEVEL_W);
  const colChannel = padRight(channelColored, CHANNEL_W);
  const colCtx = padRight(ctx, CTX_W);

  let coloredMessage = info.message;
  const colorMatch = levelColored.match(/^(\x1b\[[0-9;]*m)/); // extract ANSI color prefix
  if (colorMatch) {
    const color = colorMatch[1];
    coloredMessage = `${color}${info.message}\x1b[0m`;
  }
  
  return `[${colApp}] [${colTrace}] ${ts} ${colLevel} [${colChannel}] [${colCtx}] ${coloredMessage}`;
});

export const winstonLogger = {
  transports: [
    // ✅ CONSOLE: aligned + colored
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        contextEnricher(),
        winston.format.timestamp({ format: () => new Date().toISOString() }),
        alignedConsole,
      ),
    }),

    // ✅ FILE: structured JSON (keep all metadata)
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',
      format: winston.format.combine(
        contextEnricher(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 5_000_000,
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        contextEnricher(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
