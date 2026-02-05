import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LinearService } from './linear.service.js';
import { LinearClient } from '@linear/sdk';

vi.mock('@linear/sdk');

describe('LinearService', () => {
  let linearService: LinearService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    vi.clearAllMocks();
    linearService = new LinearService(mockApiKey);
    const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
    if (mockLinearClientInstance && !mockLinearClientInstance.archiveProject) {
      (mockLinearClientInstance as any).archiveProject = vi.fn();
    }
  });

  it('should initialize LinearClient with the provided API key', () => {
    expect(LinearClient).toHaveBeenCalledWith({ apiKey: mockApiKey });
  });

  describe('getProjects', () => {
    it('should return a list of projects', async () => {
      const mockProjects = {
        nodes: [
          { id: '1', name: 'Project 1', slugId: 'P1' },
          { id: '2', name: 'Project 2', slugId: 'P2' },
        ],
      };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.projects.mockResolvedValue(mockProjects);

      const projects = await linearService.getProjects();

      expect(projects).toEqual(mockProjects.nodes);
      expect(mockLinearClientInstance.projects).toHaveBeenCalled();
    });
  });

  describe('getProject', () => {
    it('should return a single project by ID', async () => {
      const mockProject = { id: '1', name: 'Project 1', slugId: 'P1' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.project.mockResolvedValue(mockProject);

      const project = await linearService.getProject('1');

      expect(project).toEqual(mockProject);
      expect(mockLinearClientInstance.project).toHaveBeenCalledWith('1');
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const mockProject = { id: '3', name: 'New Project', slugId: 'NP' };
      const createInput = { name: 'New Project', teamIds: ['team-1'] };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.createProject.mockResolvedValue({ success: true, project: Promise.resolve(mockProject) });

      const project = await linearService.createProject(createInput);

      expect(project).toEqual(mockProject);
      expect(mockLinearClientInstance.createProject).toHaveBeenCalledWith(createInput);
    });

    it('should throw error if project creation failed', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.createProject.mockResolvedValue({ success: false, project: Promise.resolve(undefined) });

      await expect(linearService.createProject({})).rejects.toThrow('Failed to create project');
    });
  });

  describe('updateProject', () => {
    it('should update an existing project', async () => {
      const mockProject = { id: '1', name: 'Updated Project', slugId: 'P1' };
      const updateInput = { name: 'Updated Project' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.updateProject.mockResolvedValue({ success: true, project: Promise.resolve(mockProject) });

      const project = await linearService.updateProject('1', updateInput);

      expect(project).toEqual(mockProject);
      expect(mockLinearClientInstance.updateProject).toHaveBeenCalledWith('1', updateInput);
    });

    it('should throw error if project update failed', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.updateProject.mockResolvedValue({ success: false, project: Promise.resolve(undefined) });

      await expect(linearService.updateProject('1', {})).rejects.toThrow('Failed to update project');
    });
  });

  describe('searchProjects', () => {
    it('should search projects by name', async () => {
      const mockProjects = {
        nodes: [
          { id: '1', name: 'Project 1', slugId: 'P1' },
        ],
      };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.projects.mockResolvedValue(mockProjects);

      const projects = await linearService.searchProjects('Project 1');

      expect(projects).toEqual(mockProjects.nodes);
      expect(mockLinearClientInstance.projects).toHaveBeenCalledWith({
        filter: { name: { contains: 'Project 1' } }
      });
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.archiveProject.mockResolvedValue({ success: true });

      await linearService.deleteProject('1');

      expect(mockLinearClientInstance.archiveProject).toHaveBeenCalledWith('1');
    });
  });

  describe('searchIssues', () => {
    it('should search issues by title and description', async () => {
      const mockIssues = {
        nodes: [
          { id: '1', title: 'Issue 1' },
        ],
      };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.issues.mockResolvedValue(mockIssues);

      const issues = await linearService.searchIssues('Issue 1');

      expect(issues).toEqual(mockIssues.nodes);
      expect(mockLinearClientInstance.issues).toHaveBeenCalledWith({
        filter: { 
          or: [
            { title: { contains: 'Issue 1' } },
            { description: { contains: 'Issue 1' } }
          ]
        }
      });
    });
  });

  describe('searchDocuments', () => {
    it('should search documents by title', async () => {
      const mockDocuments = {
        nodes: [
          { id: '1', title: 'Doc 1' },
        ],
      };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.documents.mockResolvedValue(mockDocuments);

      const documents = await linearService.searchDocuments('Doc 1');

      expect(documents).toEqual(mockDocuments.nodes);
      expect(mockLinearClientInstance.documents).toHaveBeenCalledWith({
        filter: { title: { contains: 'Doc 1' } }
      });
    });
  });

  describe('getTeamId', () => {
    it('should return the identifier if it is a UUID', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = await linearService.getTeamId(uuid);
      expect(result).toBe(uuid);
    });

    it('should resolve team key to UUID', async () => {
      const mockTeams = {
        nodes: [{ id: 'team-uuid', key: 'GEN' }],
      };
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.teams.mockResolvedValue(mockTeams);

      const result = await linearService.getTeamId('GEN');

      expect(result).toBe('team-uuid');
      expect(mockLinearClientInstance.teams).toHaveBeenCalledWith({
        filter: { key: { eq: 'GEN' } }
      });
    });

    it('should throw error if team key not found', async () => {
      const mockTeams = { nodes: [] };
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.teams.mockResolvedValue(mockTeams);

      await expect(linearService.getTeamId('UNKNOWN')).rejects.toThrow('Team with key "UNKNOWN" not found.');
    });
  });

  describe('getIssues', () => {
    it('should return a list of issues', async () => {
      const mockIssues = {
        nodes: [
          { id: '1', title: 'Issue 1' },
          { id: '2', title: 'Issue 2' },
        ],
      };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.issues.mockResolvedValue(mockIssues);

      const issues = await linearService.getIssues();

      expect(issues).toEqual(mockIssues.nodes);
      expect(mockLinearClientInstance.issues).toHaveBeenCalled();
    });

    it('should filter issues by project', async () => {
      const mockIssues = { nodes: [] };
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.issues.mockResolvedValue(mockIssues);

      await linearService.getIssues({ project: { id: { eq: 'proj-1' } } });

      expect(mockLinearClientInstance.issues).toHaveBeenCalledWith({
        filter: { project: { id: { eq: 'proj-1' } } }
      });
    });
  });

  describe('getIssue', () => {
    it('should return a single issue by ID', async () => {
      const mockIssue = { id: '1', title: 'Issue 1' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.issue.mockResolvedValue(mockIssue);

      const issue = await linearService.getIssue('1');

      expect(issue).toEqual(mockIssue);
      expect(mockLinearClientInstance.issue).toHaveBeenCalledWith('1');
    });
  });

  describe('createIssue', () => {
    it('should create a new issue', async () => {
      const mockIssue = { id: '3', title: 'New Issue' };
      const createInput = { title: 'New Issue', teamId: 'team-1' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.createIssue.mockResolvedValue({ success: true, issue: Promise.resolve(mockIssue) });

      const issue = await linearService.createIssue(createInput);

      expect(issue).toEqual(mockIssue);
      expect(mockLinearClientInstance.createIssue).toHaveBeenCalledWith(createInput);
    });

    it('should throw error if issue creation failed', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.createIssue.mockResolvedValue({ success: false, issue: Promise.resolve(undefined) });

      await expect(linearService.createIssue({})).rejects.toThrow('Failed to create issue');
    });
  });

  describe('updateIssue', () => {
    it('should update an existing issue', async () => {
      const mockIssue = { id: '1', title: 'Updated Issue' };
      const updateInput = { title: 'Updated Issue' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.updateIssue.mockResolvedValue({ success: true, issue: Promise.resolve(mockIssue) });

      const issue = await linearService.updateIssue('1', updateInput);

      expect(issue).toEqual(mockIssue);
      expect(mockLinearClientInstance.updateIssue).toHaveBeenCalledWith('1', updateInput);
    });

    it('should throw error if issue update failed', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.updateIssue.mockResolvedValue({ success: false, issue: Promise.resolve(undefined) });

      await expect(linearService.updateIssue('1', {})).rejects.toThrow('Failed to update issue');
    });
  });

  describe('deleteIssue', () => {
    it('should delete an issue', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      if (!(mockLinearClientInstance as any).archiveIssue) {
        (mockLinearClientInstance as any).archiveIssue = vi.fn();
      }
      mockLinearClientInstance.archiveIssue.mockResolvedValue({ success: true });

      await linearService.deleteIssue('1');

      expect(mockLinearClientInstance.archiveIssue).toHaveBeenCalledWith('1');
    });
  });

  describe('getDocuments', () => {
    it('should return a list of documents', async () => {
      const mockDocuments = {
        nodes: [
          { id: '1', title: 'Doc 1' },
          { id: '2', title: 'Doc 2' },
        ],
      };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.documents.mockResolvedValue(mockDocuments);

      const documents = await linearService.getDocuments();

      expect(documents).toEqual(mockDocuments.nodes);
      expect(mockLinearClientInstance.documents).toHaveBeenCalled();
    });

    it('should filter documents by project', async () => {
      const mockDocuments = { nodes: [] };
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.documents.mockResolvedValue(mockDocuments);

      await linearService.getDocuments({ project: { id: { eq: 'proj-1' } } });

      expect(mockLinearClientInstance.documents).toHaveBeenCalledWith({
        filter: { project: { id: { eq: 'proj-1' } } }
      });
    });
  });

  describe('getDocument', () => {
    it('should return a single document by ID', async () => {
      const mockDocument = { id: '1', title: 'Doc 1' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.document.mockResolvedValue(mockDocument);

      const document = await linearService.getDocument('1');

      expect(document).toEqual(mockDocument);
      expect(mockLinearClientInstance.document).toHaveBeenCalledWith('1');
    });
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const mockDocument = { id: '3', title: 'New Doc' };
      const createInput = { title: 'New Doc', projectId: 'proj-1' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.createDocument.mockResolvedValue({ success: true, document: Promise.resolve(mockDocument) });

      const document = await linearService.createDocument(createInput);

      expect(document).toEqual(mockDocument);
      expect(mockLinearClientInstance.createDocument).toHaveBeenCalledWith(createInput);
    });

    it('should throw error if document creation failed', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.createDocument.mockResolvedValue({ success: false, document: Promise.resolve(undefined) });

      await expect(linearService.createDocument({})).rejects.toThrow('Failed to create document');
    });
  });

  describe('updateDocument', () => {
    it('should update an existing document', async () => {
      const mockDocument = { id: '1', title: 'Updated Doc' };
      const updateInput = { title: 'Updated Doc' };
      
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.updateDocument.mockResolvedValue({ success: true, document: Promise.resolve(mockDocument) });

      const document = await linearService.updateDocument('1', updateInput);

      expect(document).toEqual(mockDocument);
      expect(mockLinearClientInstance.updateDocument).toHaveBeenCalledWith('1', updateInput);
    });

    it('should throw error if document update failed', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.updateDocument.mockResolvedValue({ success: false, document: Promise.resolve(undefined) });

      await expect(linearService.updateDocument('1', {})).rejects.toThrow('Failed to update document');
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      if (!(mockLinearClientInstance as any).deleteDocument) {
        (mockLinearClientInstance as any).deleteDocument = vi.fn();
      }
      mockLinearClientInstance.deleteDocument.mockResolvedValue({ success: true });

      await linearService.deleteDocument('1');

      expect(mockLinearClientInstance.deleteDocument).toHaveBeenCalledWith('1');
    });
  });

  describe('getWorkflowStates', () => {
    it('should return all workflow states', async () => {
      const mockStates = {
        nodes: [
          { id: 's1', name: 'Todo' },
          { id: 's2', name: 'Done' },
        ],
      };
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.workflowStates.mockResolvedValue(mockStates);

      const states = await linearService.getWorkflowStates();

      expect(states).toEqual(mockStates.nodes);
      expect(mockLinearClientInstance.workflowStates).toHaveBeenCalled();
    });
  });

  describe('getProjectStates', () => {
    it('should return all project states', async () => {
      const mockStates = {
        nodes: [
          { id: 'ps1', name: 'Planned' },
          { id: 'ps2', name: 'Started' },
        ],
      };
      const mockLinearClientInstance = vi.mocked(LinearClient).mock.instances[0];
      mockLinearClientInstance.projectStatuses.mockResolvedValue(mockStates);

      const states = await linearService.getProjectStates();

      expect(states).toEqual(mockStates.nodes);
      expect(mockLinearClientInstance.projectStatuses).toHaveBeenCalled();
    });
  });
});
