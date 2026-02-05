import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from './config.service.js';
import Conf from 'conf';

vi.mock('conf');

describe('ConfigService', () => {
  let configService: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    configService = new ConfigService();
  });

  it('should save the token', () => {
    const mockConfInstance = vi.mocked(Conf).mock.instances[0];
    configService.setToken('test-token');
    expect(mockConfInstance.set).toHaveBeenCalledWith('apiKey', 'test-token');
  });

  it('should retrieve the token', () => {
    const mockConfInstance = vi.mocked(Conf).mock.instances[0];
    mockConfInstance.get.mockReturnValue('test-token');
    const token = configService.getToken();
    expect(token).toBe('test-token');
    expect(mockConfInstance.get).toHaveBeenCalledWith('apiKey');
  });

  it('should delete the token', () => {
    const mockConfInstance = vi.mocked(Conf).mock.instances[0];
    configService.deleteToken();
    expect(mockConfInstance.delete).toHaveBeenCalledWith('apiKey');
  });

  it('should save the default team ID', () => {
    const mockConfInstance = vi.mocked(Conf).mock.instances[0];
    configService.setDefaultTeam('team-1');
    expect(mockConfInstance.set).toHaveBeenCalledWith('defaultTeamId', 'team-1');
  });

  it('should retrieve the default team ID', () => {
    const mockConfInstance = vi.mocked(Conf).mock.instances[0];
    mockConfInstance.get.mockReturnValue('team-1');
    const teamId = configService.getDefaultTeam();
    expect(teamId).toBe('team-1');
    expect(mockConfInstance.get).toHaveBeenCalledWith('defaultTeamId');
  });
});
