export const DEFAULT_DAEMON_HOST = 'localhost';
export const DEFAULT_DAEMON_PORT = 47291;
export const DAEMON_WS_PATH = '/ws';

export function getDaemonHttpOrigin(
  host = DEFAULT_DAEMON_HOST,
  port = DEFAULT_DAEMON_PORT,
): string {
  return `http://${host}:${port}`;
}

export function getDaemonWsUrl(
  host = DEFAULT_DAEMON_HOST,
  port = DEFAULT_DAEMON_PORT,
  path = DAEMON_WS_PATH,
): string {
  return `ws://${host}:${port}${path}`;
}
