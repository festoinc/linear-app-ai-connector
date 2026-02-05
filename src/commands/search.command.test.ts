import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchCommand } from './search.command.js';
import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';

vi.mock('../services/linear.service.js');
vi.mock('../services/config.service.js');

describe('Search Command', () => {
  let mockLinearService: any;
  let mockConfigService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConfigService = {
      getToken: vi.fn().mockReturnValue('test-token'),
    };
    vi.mocked(ConfigService).mockImplementation(function() {
      return mockConfigService;
    } as any);

    mockLinearService = {
      searchProjects: vi.fn().mockResolvedValue([]),
      searchIssues: vi.fn().mockResolvedValue([]),
      searchDocuments: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(LinearService).mockImplementation(function() {
      return mockLinearService;
    } as any);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should error if not authenticated', async () => {
    mockConfigService.getToken.mockReturnValue(undefined);
    await searchCommand('query');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
  });

  it('should search for projects, issues, and documents', async () => {
    const mockProjects = [{ id: 'p1', name: 'Project 1' }];
    const mockIssues = [{ id: 'i1', title: 'Issue 1', identifier: 'ABC-1' }];
    const mockDocuments = [{ id: 'd1', title: 'Doc 1' }];

    mockLinearService.searchProjects.mockResolvedValue(mockProjects);
    mockLinearService.searchIssues.mockResolvedValue(mockIssues);
    mockLinearService.searchDocuments.mockResolvedValue(mockDocuments);

    await searchCommand('test');

    expect(mockLinearService.searchProjects).toHaveBeenCalledWith('test');
    expect(mockLinearService.searchIssues).toHaveBeenCalledWith('test');
    expect(mockLinearService.searchDocuments).toHaveBeenCalledWith('test');

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--- Projects ---'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Project 1'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--- Issues ---'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ABC-1: Issue 1'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--- Documents ---'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Doc 1'));
  });

  it('should show "No results" if nothing found', async () => {
    await searchCommand('nothing');

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No projects found.'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No issues found.'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No documents found.'));
  });

  it('should handle errors', async () => {
    mockLinearService.searchProjects.mockRejectedValue(new Error('Search Error'));
    await searchCommand('query');
    expect(console.error).toHaveBeenCalledWith('Error: Search Error');
  });
});
