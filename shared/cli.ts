import type { ToolConnection, ToolId } from './types.ts';

export interface CliToolActionResult {
  success: boolean;
  tool: ToolId;
  command: string;
  message: string;
  stdout: string;
  stderr: string;
  connection: ToolConnection | null;
}
