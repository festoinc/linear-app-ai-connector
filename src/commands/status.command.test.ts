import { describe, it, expect, vi, beforeEach } from 'vitest';
import { statusListCommand, statusSetCommand } from './status.command.js';
import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';

vi.mock('../services/linear.service.js');
vi.mock('../services/config.service.js');

describe('Status Commands', () => {
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
      getWorkflowStates: vi.fn().mockResolvedValue([]),
      getProjectStates: vi.fn().mockResolvedValue([]),
      getIssue: vi.fn(),
      getProject: vi.fn(),
      updateIssue: vi.fn(),
      updateProject: vi.fn(),
    };
    vi.mocked(LinearService).mockImplementation(function() {
      return mockLinearService;
    } as any);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('statusListCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await statusListCommand();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should list task and project statuses', async () => {
      const mockWorkflowStates = [
        { id: 's1', name: 'Todo' },
        { id: 's2', name: 'Done' },
      ];
      const mockProjectStates = [
        { id: 'ps1', name: 'Planned' },
        { id: 'ps2', name: 'Started' },
      ];

      mockLinearService.getWorkflowStates.mockResolvedValue(mockWorkflowStates);
      mockLinearService.getProjectStates.mockResolvedValue(mockProjectStates);

      await statusListCommand();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--- Task Statuses ---'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[s1] Todo'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[s2] Done'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--- Project Statuses ---'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[ps1] Planned'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[ps2] Started'));
    });

    it('should show "No statuses found" if empty', async () => {
      await statusListCommand();
      expect(console.log).toHaveBeenCalledWith('No task statuses found.');
      expect(console.log).toHaveBeenCalledWith('No project statuses found.');
    });

    it('should handle errors', async () => {
      mockLinearService.getWorkflowStates.mockRejectedValue(new Error('API Error'));
      await statusListCommand();
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('statusSetCommand', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';

    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await statusSetCommand('id', 'status');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should update task status by ID', async () => {
      const mockIssue = { id: 'i1', identifier: 'ABC-1' };
      mockLinearService.getIssue.mockResolvedValue(mockIssue);
      mockLinearService.updateIssue.mockResolvedValue(mockIssue);

      await statusSetCommand('ABC-1', validUuid);

      expect(mockLinearService.getIssue).toHaveBeenCalledWith('ABC-1');
      expect(mockLinearService.updateIssue).toHaveBeenCalledWith('i1', { stateId: validUuid });
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Status updated successfully'));
    });

    it('should update task status by Name', async () => {
      const mockIssue = { id: 'i1', identifier: 'ABC-1' };
      const mockWorkflowStates = [{ id: validUuid, name: 'Done' }];
      mockLinearService.getIssue.mockResolvedValue(mockIssue);
      mockLinearService.getWorkflowStates.mockResolvedValue(mockWorkflowStates);
      mockLinearService.updateIssue.mockResolvedValue(mockIssue);

      await statusSetCommand('ABC-1', 'Done');

      expect(mockLinearService.getWorkflowStates).toHaveBeenCalled();
      expect(mockLinearService.updateIssue).toHaveBeenCalledWith('i1', { stateId: validUuid });
    });

    it('should update project status by ID', async () => {
      const mockProject = { id: 'p1', name: 'Project 1' };
      mockLinearService.getIssue.mockRejectedValue(new Error('Not found'));
      mockLinearService.getProject.mockResolvedValue(mockProject);
      mockLinearService.updateProject.mockResolvedValue(mockProject);

      await statusSetCommand('p1', validUuid);

      expect(mockLinearService.getProject).toHaveBeenCalledWith('p1');
      expect(mockLinearService.updateProject).toHaveBeenCalledWith('p1', { statusId: validUuid });
    });

    it('should update project status by Name', async () => {
      const mockProject = { id: 'p1', name: 'Project 1' };
      const mockProjectStates = [{ id: validUuid, name: 'Started' }];
      mockLinearService.getIssue.mockRejectedValue(new Error('Not found'));
      mockLinearService.getProject.mockResolvedValue(mockProject);
      mockLinearService.getProjectStates.mockResolvedValue(mockProjectStates);
      mockLinearService.updateProject.mockResolvedValue(mockProject);

      await statusSetCommand('p1', 'Started');

      expect(mockLinearService.getProjectStates).toHaveBeenCalled();
      expect(mockLinearService.updateProject).toHaveBeenCalledWith('p1', { statusId: validUuid });
    });

    it('should error if status name not found', async () => {
      mockLinearService.getIssue.mockResolvedValue({ id: 'i1' });
      mockLinearService.getWorkflowStates.mockResolvedValue([]);

      await statusSetCommand('i1', 'Invalid');

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Status "Invalid" not found for tasks'));
    });

    it('should error if project status name not found', async () => {
      mockLinearService.getIssue.mockRejectedValue(new Error('Not found'));
      mockLinearService.getProject.mockResolvedValue({ id: 'p1' });
      mockLinearService.getProjectStates.mockResolvedValue([]);

      await statusSetCommand('p1', 'Invalid');

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Status "Invalid" not found for projects'));
    });

    it('should handle general errors', async () => {
      mockLinearService.getIssue.mockRejectedValue(new Error('Not found'));
      mockLinearService.getProject.mockResolvedValue({ id: 'p1' });
      mockLinearService.updateProject.mockImplementationOnce(() => { throw new Error('Unexpected'); });
      
      await statusSetCommand('p1', validUuid);
      expect(console.error).toHaveBeenCalledWith('Error: Unexpected');
    });

    it('should error if ID not found as task or project', async () => {
      mockLinearService.getIssue.mockRejectedValue(new Error('Issue not found'));
      mockLinearService.getProject.mockRejectedValue(new Error('Project not found'));

      await statusSetCommand('invalid', 'status');

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Entity with ID "invalid" not found'));
    });
  });
});
