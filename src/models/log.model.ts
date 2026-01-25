export enum LogType {
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

export type LogCallback = (message: string, type: LogType) => void;
