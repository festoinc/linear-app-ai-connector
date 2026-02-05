import { ConfigService } from '../services/config.service.js';

export function authCommand(token: string): void {
  if (!token) {
    console.error('Error: Token is required. Usage: linear auth <token>');
    return;
  }

  const configService = new ConfigService();
  configService.setToken(token);
  console.log('Successfully authenticated with Linear!');
}
