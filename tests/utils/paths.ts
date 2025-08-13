import path from 'path';
import fs from 'fs';

// Resolve project root relative to this file to avoid reliance on process.cwd()
export const projectRoot: string = path.resolve(__dirname, '../../');

export const storageStatesDir: string = path.join(projectRoot, 'storageStates');
export const storageStatePath: string = path.join(storageStatesDir, 'auth.json');
const envDir: string = path.join(projectRoot, 'env');
const currentEnvironment: string | undefined = process.env.ENV?.trim();
const candidateEnvPath: string = currentEnvironment
  ? path.join(envDir, `.env.${currentEnvironment}`)
  : path.join(envDir, '.env');

export const envFilePath: string = fs.existsSync(candidateEnvPath)
  ? candidateEnvPath
  : path.join(envDir, '.env');
