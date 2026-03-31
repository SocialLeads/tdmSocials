import * as fs from 'fs';
import * as path from 'path';

export function readJsonFile(filename: string) {
    try {
      // Use process.cwd() to get the project root, then navigate to src/utils/resources
      const configPath = path.join(process.cwd(), 'src', 'utils', 'resources', filename);
      const fileContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to read ${filename} config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }