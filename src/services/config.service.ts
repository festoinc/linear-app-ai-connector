import Conf from 'conf';

export class ConfigService {
  private config: Conf<{ apiKey: string; defaultTeamId: string }>;

  constructor() {
    this.config = new Conf({ projectName: 'linear-cli' });
  }

  setToken(token: string): void {
    this.config.set('apiKey', token);
  }

  getToken(): string | undefined {
    return this.config.get('apiKey');
  }

  deleteToken(): void {
    this.config.delete('apiKey');
  }

  setDefaultTeam(teamId: string): void {
    this.config.set('defaultTeamId', teamId);
  }

  getDefaultTeam(): string | undefined {
    return this.config.get('defaultTeamId');
  }
}
