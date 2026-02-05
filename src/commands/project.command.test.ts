import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectListCommand, projectShowCommand, projectCreateCommand, projectUpdateCommand, projectDeleteCommand, projectSearchCommand } from './project.command.js';
import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';

vi.mock('../services/linear.service.js');
vi.mock('../services/config.service.js');

describe('Project Commands', () => {
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
      getProjects: vi.fn(),
      getProject: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      searchProjects: vi.fn(),
      getTeamId: vi.fn(),
    };
    vi.mocked(LinearService).mockImplementation(function() {
      return mockLinearService;
    } as any);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('projectListCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await projectListCommand();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should list projects', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', slugId: 'P1' },
        { id: '2', name: 'Project 2', slugId: 'P2' },
      ];
      mockLinearService.getProjects.mockResolvedValue(mockProjects);

      await projectListCommand();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Project 1'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Project 2'));
    });

    it('should show message if no projects found', async () => {
      mockLinearService.getProjects.mockResolvedValue([]);
      await projectListCommand();
      expect(console.log).toHaveBeenCalledWith('No projects found.');
    });

    it('should handle errors', async () => {
      mockLinearService.getProjects.mockRejectedValue(new Error('API Error'));
      await projectListCommand();
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('projectShowCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await projectShowCommand('1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should show project details', async () => {
      const mockProject = { id: '1', name: 'Project 1', slugId: 'P1', description: 'Test description' };
      mockLinearService.getProject.mockResolvedValue(mockProject);

      await projectShowCommand('1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Project 1'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Test description'));
    });

    it('should show project details without description', async () => {
      const mockProject = { id: '1', name: 'Project 1', slugId: 'P1' };
      mockLinearService.getProject.mockResolvedValue(mockProject);

      await projectShowCommand('1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Project 1'));
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('Description:'));
    });

    it('should show error if project not found', async () => {
      mockLinearService.getProject.mockResolvedValue(null);
      await projectShowCommand('invalid-id');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('should handle errors', async () => {
      mockLinearService.getProject.mockRejectedValue(new Error('API Error'));
      await projectShowCommand('1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('projectCreateCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await projectCreateCommand('New Project', 'team-1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should error if no team ID is provided or set as default', async () => {
      mockConfigService.getDefaultTeam.mockReturnValue(undefined);
      await projectCreateCommand('New Project');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Team ID is required'));
    });

    it('should create a project with provided teamId', async () => {
      const mockProject = { id: '3', name: 'New Project', slugId: 'NP' };
      mockLinearService.getTeamId.mockResolvedValue('team-uuid');
      mockLinearService.createProject.mockResolvedValue(mockProject);

      await projectCreateCommand('New Project', 'team-1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
      expect(mockLinearService.getTeamId).toHaveBeenCalledWith('team-1');
      expect(mockLinearService.createProject).toHaveBeenCalledWith({ name: 'New Project', teamIds: ['team-uuid'] });
    });

    it('should create a project with default teamId if not provided', async () => {
      const mockProject = { id: '3', name: 'New Project', slugId: 'NP' };
      mockLinearService.getTeamId.mockResolvedValue('default-uuid');
      mockLinearService.createProject.mockResolvedValue(mockProject);
      mockConfigService.getDefaultTeam.mockReturnValue('default-team');

      await projectCreateCommand('New Project');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
      expect(mockLinearService.getTeamId).toHaveBeenCalledWith('default-team');
      expect(mockLinearService.createProject).toHaveBeenCalledWith({ name: 'New Project', teamIds: ['default-uuid'] });
    });

    it('should handle errors', async () => {
      mockLinearService.getTeamId.mockRejectedValue(new Error('API Error'));
      await projectCreateCommand('New Project', 'team-1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('projectUpdateCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await projectUpdateCommand('1', 'New Name');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should update a project', async () => {
      const mockProject = { id: '1', name: 'Updated Project', slugId: 'P1' };
      mockLinearService.updateProject.mockResolvedValue(mockProject);

      await projectUpdateCommand('1', 'Updated Project');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('updated successfully'));
      expect(mockLinearService.updateProject).toHaveBeenCalledWith('1', { name: 'Updated Project' });
    });

    it('should handle errors', async () => {
      mockLinearService.updateProject.mockRejectedValue(new Error('API Error'));
      await projectUpdateCommand('1', 'New Name');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('projectDeleteCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await projectDeleteCommand('1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should delete a project', async () => {
      mockLinearService.deleteProject.mockResolvedValue(undefined);

      await projectDeleteCommand('1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('deleted successfully'));
      expect(mockLinearService.deleteProject).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      mockLinearService.deleteProject.mockRejectedValue(new Error('API Error'));
      await projectDeleteCommand('1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('projectSearchCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await projectSearchCommand('query');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should search projects', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', slugId: 'P1' },
      ];
      mockLinearService.searchProjects.mockResolvedValue(mockProjects);

      await projectSearchCommand('Project 1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Project 1'));
      expect(mockLinearService.searchProjects).toHaveBeenCalledWith('Project 1');
    });

    it('should show message if no projects found', async () => {
      mockLinearService.searchProjects.mockResolvedValue([]);
      await projectSearchCommand('Unknown');
      expect(console.log).toHaveBeenCalledWith('No projects found matching "Unknown".');
    });

    it('should handle errors', async () => {
      mockLinearService.searchProjects.mockRejectedValue(new Error('API Error'));
      await projectSearchCommand('query');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });
});
