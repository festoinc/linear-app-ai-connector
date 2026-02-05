import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgram } from './index.js';
import * as authCmd from './commands/auth.command.js';
import * as projectCmd from './commands/project.command.js';
import * as taskCmd from './commands/task.command.js';
import * as docCmd from './commands/doc.command.js';
import * as searchCmd from './commands/search.command.js';
import * as statusCmd from './commands/status.command.js';

vi.mock('./commands/auth.command.js');
vi.mock('./commands/project.command.js');
vi.mock('./commands/task.command.js');
vi.mock('./commands/doc.command.js');
vi.mock('./commands/search.command.js');
vi.mock('./commands/status.command.js');

describe('CLI program', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have auth command', () => {
    const program = createProgram();
    const authCommand = program.commands.find(c => c.name() === 'auth');
    expect(authCommand).toBeDefined();
  });

  it('should call authCommand when auth is executed', async () => {
    const program = createProgram();
    const spy = vi.spyOn(authCmd, 'authCommand');
    await program.parseAsync(['node', 'linear', 'auth', 'test-token']);
    expect(spy).toHaveBeenCalledWith('test-token');
  });

  it('should call searchCommand when search is executed', async () => {
    const program = createProgram();
    const spy = vi.spyOn(searchCmd, 'searchCommand');
    await program.parseAsync(['node', 'linear', 'search', 'query']);
    expect(spy).toHaveBeenCalledWith('query');
  });

  describe('status commands', () => {
    it('should call statusListCommand when status list is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(statusCmd, 'statusListCommand');
      await program.parseAsync(['node', 'linear', 'status', 'list']);
      expect(spy).toHaveBeenCalled();
    });

    it('should call statusSetCommand when status set is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(statusCmd, 'statusSetCommand');
      await program.parseAsync(['node', 'linear', 'status', 'set', 'ABC-1', 'Done']);
      expect(spy).toHaveBeenCalledWith('ABC-1', 'Done');
    });
  });

  describe('project commands', () => {
    it('should call projectListCommand when project list is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(projectCmd, 'projectListCommand');
      await program.parseAsync(['node', 'linear', 'project', 'list']);
      expect(spy).toHaveBeenCalled();
    });

    it('should call projectShowCommand when project show is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(projectCmd, 'projectShowCommand');
      await program.parseAsync(['node', 'linear', 'project', 'show', '123']);
      expect(spy).toHaveBeenCalledWith('123');
    });

    it('should call projectCreateCommand when project create is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(projectCmd, 'projectCreateCommand');
      await program.parseAsync(['node', 'linear', 'project', 'create', 'My Project', 'team-1']);
      expect(spy).toHaveBeenCalledWith('My Project', 'team-1');
    });

    it('should call projectUpdateCommand when project update is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(projectCmd, 'projectUpdateCommand');
      await program.parseAsync(['node', 'linear', 'project', 'update', '123', 'New Name']);
      expect(spy).toHaveBeenCalledWith('123', 'New Name');
    });

    it('should call projectDeleteCommand when project delete is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(projectCmd, 'projectDeleteCommand');
      await program.parseAsync(['node', 'linear', 'project', 'delete', '123']);
      expect(spy).toHaveBeenCalledWith('123');
    });

    it('should call projectSearchCommand when project search is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(projectCmd, 'projectSearchCommand');
      await program.parseAsync(['node', 'linear', 'project', 'search', 'query']);
      expect(spy).toHaveBeenCalledWith('query');
    });
  });

  describe('team commands', () => {
    it('should set default team ID', async () => {
      const program = createProgram();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await program.parseAsync(['node', 'linear', 'team', 'set-default', 'team-123']);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Default team ID set to: team-123'));
    });
  });

  describe('task commands', () => {
    it('should call taskListCommand when task list is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(taskCmd, 'taskListCommand');
      await program.parseAsync(['node', 'linear', 'task', 'list', '--project', 'proj-1']);
      expect(spy).toHaveBeenCalledWith({ project: 'proj-1' });
    });

    it('should call taskShowCommand when task show is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(taskCmd, 'taskShowCommand');
      await program.parseAsync(['node', 'linear', 'task', 'show', '123']);
      expect(spy).toHaveBeenCalledWith('123');
    });

    it('should call taskCreateCommand when task create is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(taskCmd, 'taskCreateCommand');
      await program.parseAsync(['node', 'linear', 'task', 'create', 'My Task', 'team-1', '--project', 'proj-1', '--description', 'desc']);
      expect(spy).toHaveBeenCalledWith('My Task', 'team-1', { project: 'proj-1', description: 'desc' });
    });

    it('should call taskUpdateCommand when task update is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(taskCmd, 'taskUpdateCommand');
      await program.parseAsync(['node', 'linear', 'task', 'update', '123', '--title', 'New Title', '--description', 'New Desc']);
      expect(spy).toHaveBeenCalledWith('123', { title: 'New Title', description: 'New Desc' });
    });

    it('should call taskDeleteCommand when task delete is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(taskCmd, 'taskDeleteCommand');
      await program.parseAsync(['node', 'linear', 'task', 'delete', '123']);
      expect(spy).toHaveBeenCalledWith('123');
    });
  });

  describe('doc commands', () => {
    it('should call docListCommand when doc list is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(docCmd, 'docListCommand');
      await program.parseAsync(['node', 'linear', 'doc', 'list', '--project', 'proj-1']);
      expect(spy).toHaveBeenCalledWith({ project: 'proj-1' });
    });

    it('should call docShowCommand when doc show is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(docCmd, 'docShowCommand');
      await program.parseAsync(['node', 'linear', 'doc', 'show', '123']);
      expect(spy).toHaveBeenCalledWith('123');
    });

    it('should call docCreateCommand when doc create is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(docCmd, 'docCreateCommand');
      await program.parseAsync(['node', 'linear', 'doc', 'create', 'My Doc', 'proj-1', '--content', 'content']);
      expect(spy).toHaveBeenCalledWith('My Doc', 'proj-1', { content: 'content' });
    });

    it('should call docUpdateCommand when doc update is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(docCmd, 'docUpdateCommand');
      await program.parseAsync(['node', 'linear', 'doc', 'update', '123', '--title', 'New Title', '--content', 'New Content']);
      expect(spy).toHaveBeenCalledWith('123', { title: 'New Title', content: 'New Content' });
    });

    it('should call docDeleteCommand when doc delete is executed', async () => {
      const program = createProgram();
      const spy = vi.spyOn(docCmd, 'docDeleteCommand');
      await program.parseAsync(['node', 'linear', 'doc', 'delete', '123']);
      expect(spy).toHaveBeenCalledWith('123');
    });
  });
});