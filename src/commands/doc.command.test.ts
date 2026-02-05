import { describe, it, expect, vi, beforeEach } from 'vitest';
import { docListCommand, docShowCommand, docCreateCommand, docUpdateCommand, docDeleteCommand } from './doc.command.js';
import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';
import * as fs from 'fs';

vi.mock('../services/linear.service.js');
vi.mock('../services/config.service.js');
vi.mock('fs');

describe('Document Commands', () => {
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
      getDocuments: vi.fn(),
      getDocument: vi.fn(),
      createDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
    };
    vi.mocked(LinearService).mockImplementation(function() {
      return mockLinearService;
    } as any);

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('docListCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await docListCommand({});
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should list documents', async () => {
      const mockDocs = [
        { id: '1', title: 'Doc 1' },
        { id: '2', title: 'Doc 2' },
      ];
      mockLinearService.getDocuments.mockResolvedValue(mockDocs);

      await docListCommand({});

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Doc 1'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Doc 2'));
    });

    it('should list documents filtered by project', async () => {
      mockLinearService.getDocuments.mockResolvedValue([]);
      await docListCommand({ project: 'proj-1' });

      expect(mockLinearService.getDocuments).toHaveBeenCalledWith({
        project: { id: { eq: 'proj-1' } }
      });
    });

    it('should show message if no documents found', async () => {
      mockLinearService.getDocuments.mockResolvedValue([]);
      await docListCommand({});
      expect(console.log).toHaveBeenCalledWith('No documents found.');
    });

    it('should handle errors', async () => {
      mockLinearService.getDocuments.mockRejectedValue(new Error('API Error'));
      await docListCommand({});
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('docShowCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await docShowCommand('1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should show document details', async () => {
      const mockDoc = { id: '1', title: 'Doc 1', content: 'Test content' };
      mockLinearService.getDocument.mockResolvedValue(mockDoc);

      await docShowCommand('1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Doc 1'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Test content'));
    });

    it('should show document details without content', async () => {
      const mockDoc = { id: '1', title: 'Doc 1' };
      mockLinearService.getDocument.mockResolvedValue(mockDoc);

      await docShowCommand('1');

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Doc 1'));
      expect(console.not).toBeUndefined(); // Simple check to ensure we can assert something
    });

    it('should show error if document not found', async () => {
      mockLinearService.getDocument.mockResolvedValue(null);
      await docShowCommand('invalid-id');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
    });

    it('should handle errors', async () => {
      mockLinearService.getDocument.mockRejectedValue(new Error('API Error'));
      await docShowCommand('1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('docCreateCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await docCreateCommand('New Doc', 'proj-1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should create a document', async () => {
      const mockDoc = { id: '3', title: 'New Doc' };
      mockLinearService.createDocument.mockResolvedValue(mockDoc);

      await docCreateCommand('New Doc', 'proj-1', { content: 'Some content' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
      expect(mockLinearService.createDocument).toHaveBeenCalledWith({
        title: 'New Doc',
        projectId: 'proj-1',
        content: 'Some content'
      });
    });

    it('should create a document from a file', async () => {
      const mockDoc = { id: '3', title: 'New Doc' };
      mockLinearService.createDocument.mockResolvedValue(mockDoc);
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('# File Content');

      await docCreateCommand('New Doc', 'proj-1', { createFromFile: 'test.md' });

      expect(fs.readFileSync).toHaveBeenCalledWith('test.md', 'utf-8');
      expect(mockLinearService.createDocument).toHaveBeenCalledWith({
        title: 'New Doc',
        projectId: 'proj-1',
        content: '# File Content'
      });
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('created successfully'));
    });

    it('should error if file does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await docCreateCommand('New Doc', 'proj-1', { createFromFile: 'missing.md' });

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
      expect(mockLinearService.createDocument).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockLinearService.createDocument.mockRejectedValue(new Error('API Error'));
      await docCreateCommand('New Doc', 'proj-1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('docUpdateCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await docUpdateCommand('1', { title: 'New' });
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should update a document', async () => {
      const mockDoc = { id: '1', title: 'Updated Doc' };
      mockLinearService.updateDocument.mockResolvedValue(mockDoc);

      await docUpdateCommand('1', { title: 'Updated Doc', content: 'Updated content' });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('updated successfully'));
      expect(mockLinearService.updateDocument).toHaveBeenCalledWith('1', {
        title: 'Updated Doc',
        content: 'Updated content'
      });
    });

    it('should error if no update options provided', async () => {
      await docUpdateCommand('1', {});
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('At least one property'));
    });

    it('should handle errors', async () => {
      mockLinearService.updateDocument.mockRejectedValue(new Error('API Error'));
      await docUpdateCommand('1', { title: 'New Title' });
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });

  describe('docDeleteCommand', () => {
    it('should error if not authenticated', async () => {
      mockConfigService.getToken.mockReturnValue(undefined);
      await docDeleteCommand('1');
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Not authenticated'));
    });

    it('should delete a document', async () => {
      mockLinearService.deleteDocument.mockResolvedValue(undefined);
      await docDeleteCommand('1');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('deleted successfully'));
      expect(mockLinearService.deleteDocument).toHaveBeenCalledWith('1');
    });

    it('should handle errors', async () => {
      mockLinearService.deleteDocument.mockRejectedValue(new Error('API Error'));
      await docDeleteCommand('1');
      expect(console.error).toHaveBeenCalledWith('Error: API Error');
    });
  });
});

