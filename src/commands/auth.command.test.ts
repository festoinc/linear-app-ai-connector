import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authCommand } from './auth.command.js';
import { ConfigService } from '../services/config.service.js';

vi.mock('../services/config.service.js');

describe('authCommand', () => {
  let mockConfigService: any;
  let logSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfigService = {
      setToken: vi.fn(),
    };
    vi.mocked(ConfigService).mockImplementation(function() {
      return mockConfigService;
    } as any);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should save the token and log success message', () => {
    authCommand('test-token');
    expect(mockConfigService.setToken).toHaveBeenCalledWith('test-token');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully authenticated'));
  });

  it('should log error if token is missing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    authCommand('');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Token is required'));
    expect(mockConfigService.setToken).not.toHaveBeenCalled();
  });
});