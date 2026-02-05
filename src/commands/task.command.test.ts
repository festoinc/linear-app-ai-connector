import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskListCommand, taskShowCommand, taskCreateCommand, taskUpdateCommand, taskDeleteCommand } from './task.command.js';
import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';

vi.mock('../services/linear.service.js');
vi.mock('../services/config.service.js');

describe('Task Commands', () => {
  let mockLinearService: any;
  let mockConfigService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockConfigService = {
      getToken: vi.fn().mockReturnValue('test-token'),
      getDefaultTeam: vi.fn(),
    };
    vi.mocked(ConfigService).mockImplementation(function() {
      return mockConfigService;
    } as any);

    mockLinearService = {
      getIssues: vi.fn(),
      getIssue: vi.fn(),
      createIssue: vi.fn(),
      updateIssue: vi.fn(),
      deleteIssue: vi.fn(),
      getTeamId: vi.fn(),
    };
    vi.mocked(LinearService).mockImplementation(function() {
      return mockLinearService;
    } as any);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('taskListCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await taskListCommand({});
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should list tasks', async () => {
      const mockIssues = [
        { id: '1', identifier: 'ENG-1', title: 'Task 1' },
        { id: '2', identifier: 'ENG-2', title: 'Task 2' },
      ];
      mockLinearService.getIssues.mockResolvedValue(mockIssues);

      await taskListCommand({});

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Task 1'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('ENG-1'));
    });

    it('should list tasks filtered by project', async () => {
      mockLinearService.getIssues.mockResolvedValue([]);
      await taskListCommand({ project: 'proj-1' });

      expect(mockLinearService.getIssues).toHaveBeenCalledWith({
        project: { id: { eq: 'proj-1' } }
      });
    });

    it('should show message if no tasks found', async () => {
      mockLinearService.getIssues.mockResolvedValue([]);
      await taskListCommand({});
      expect(console.log).toHaveBeenCalledWith('No tasks found.');
    });

    it('should handle errors', async () => {
      mockLinearService.getIssues.mockRejectedValue(new Error('API Error'));
      await taskListCommand({});
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('taskShowCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await taskShowCommand('1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should show task details', async () => {
      const mockIssue = { id: '1', identifier: 'ENG-1', title: 'Task 1', description: 'Test description' };
      mockLinearService.getIssue.mockResolvedValue(mockIssue);

      await taskShowCommand('1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Task 1'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Test description'));
    });

    it('should show task details without description', async () => {
      const mockIssue = { id: '1', identifier: 'ENG-1', title: 'Task 1' };
      mockLinearService.getIssue.mockResolvedValue(mockIssue);

      await taskShowCommand('1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Task 1'));
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('Description:'));
    });

    it('should show error if task not found', async () => {
      mockLinearService.getIssue.mockResolvedValue(null);
      await taskShowCommand('invalid-id');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('should handle errors', async () => {
      mockLinearService.getIssue.mockRejectedValue(new Error('API Error'));
      await taskShowCommand('1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('taskCreateCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await taskCreateCommand('New Task');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should create a task', async () => {
      const mockIssue = { id: '3', identifier: 'ENG-3', title: 'New Task' };
      mockLinearService.getTeamId.mockResolvedValue('team-uuid');
      mockLinearService.createIssue.mockResolvedValue(mockIssue);

      await taskCreateCommand('New Task', 'team-1', { project: 'proj-1', description: 'desc' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
      expect(mockLinearService.createIssue).toHaveBeenCalledWith({
        title: 'New Task',
        teamId: 'team-uuid',
        projectId: 'proj-1',
        description: 'desc'
      });
    });

    it('should create a task without optional fields', async () => {
      const mockIssue = { id: '3', identifier: 'ENG-3', title: 'New Task' };
      mockLinearService.getTeamId.mockResolvedValue('team-uuid');
      mockLinearService.createIssue.mockResolvedValue(mockIssue);

      await taskCreateCommand('New Task', 'team-1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
      expect(mockLinearService.createIssue).toHaveBeenCalledWith({
        title: 'New Task',
        teamId: 'team-uuid'
      });
    });

    it('should error if no team ID provided', async () => {
      mockConfigService.getDefaultTeam.mockReturnValue(undefined);
      await taskCreateCommand('New Task');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Team ID is required'));
    });

    it('should handle errors', async () => {
      mockLinearService.getTeamId.mockRejectedValue(new Error('API Error'));
      await taskCreateCommand('New Task', 'team-1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('taskUpdateCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await taskUpdateCommand('1', { title: 'New' });
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should update a task with title', async () => {
      const mockIssue = { id: '1', identifier: 'ENG-1', title: 'Updated Task' };
      mockLinearService.updateIssue.mockResolvedValue(mockIssue);

      await taskUpdateCommand('1', { title: 'Updated Task' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('updated successfully'));
      expect(mockLinearService.updateIssue).toHaveBeenCalledWith('1', { title: 'Updated Task' });
    });

    it('should update a task with description', async () => {
      const mockIssue = { id: '1', identifier: 'ENG-1', title: 'Task' };
      mockLinearService.updateIssue.mockResolvedValue(mockIssue);

      await taskUpdateCommand('1', { description: 'Updated Desc' });

      expect(mockLinearService.updateIssue).toHaveBeenCalledWith('1', { description: 'Updated Desc' });
    });

    it('should update a task with both title and description', async () => {
      const mockIssue = { id: '1', identifier: 'ENG-1', title: 'Updated' };
      mockLinearService.updateIssue.mockResolvedValue(mockIssue);

      await taskUpdateCommand('1', { title: 'Updated', description: 'Updated Desc' });

      expect(mockLinearService.updateIssue).toHaveBeenCalledWith('1', { title: 'Updated', description: 'Updated Desc' });
    });

    it('should error if no update options provided', async () => {
      await taskUpdateCommand('1', {});
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('At least one property'));
    });

    it('should handle errors', async () => {
      mockLinearService.updateIssue.mockRejectedValue(new Error('API Error'));
      await taskUpdateCommand('1', { title: 'New Title' });
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('taskDeleteCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await taskDeleteCommand('1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should delete a task', async () => {
      mockLinearService.deleteIssue.mockResolvedValue(undefined);
      await taskDeleteCommand('1');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('deleted successfully'));
      expect(mockLinearService.deleteIssue).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      mockLinearService.deleteIssue.mockRejectedValue(new Error('API Error'));
      await taskDeleteCommand('1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });
});
