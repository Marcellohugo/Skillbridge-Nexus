type LogLevel = "info" | "warn" | "error";

function writeLog(level: LogLevel, message: string, meta?: unknown) {
  const stamp = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : "";

  if (level === "error") {
    console.error(`[${stamp}] [${level}] ${message}${payload}`);
    return;
  }

  if (level === "warn") {
    console.warn(`[${stamp}] [${level}] ${message}${payload}`);
    return;
  }

  console.info(`[${stamp}] [${level}] ${message}${payload}`);
}

export const logger = {
  info: (message: string, meta?: unknown) => writeLog("info", message, meta),
  warn: (message: string, meta?: unknown) => writeLog("warn", message, meta),
  error: (message: string, meta?: unknown) => writeLog("error", message, meta),
};
