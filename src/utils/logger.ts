type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function log(level: LogLevel, ...args: any[]) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase().padEnd(5)}]`;
  if (level === 'error') {
    console.error(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
}

export const logger = {
  info:  (...args: any[]) => log('info',  ...args),
  warn:  (...args: any[]) => log('warn',  ...args),
  error: (...args: any[]) => log('error', ...args),
  debug: (...args: any[]) => log('debug', ...args),
};
