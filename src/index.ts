#!/usr/bin/env node
import { Command } from 'commander';
import { authCommand } from './commands/auth.command.js';
import { projectListCommand, projectShowCommand, projectCreateCommand, projectUpdateCommand, projectDeleteCommand, projectSearchCommand } from './commands/project.command.js';
import { taskListCommand, taskShowCommand, taskCreateCommand, taskUpdateCommand, taskDeleteCommand } from './commands/task.command.js';
import { docListCommand, docShowCommand, docCreateCommand, docUpdateCommand, docDeleteCommand } from './commands/doc.command.js';
import { searchCommand } from './commands/search.command.js';
import { statusListCommand, statusSetCommand } from './commands/status.command.js';
import { ConfigService } from './services/config.service.js';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('linear')
    .description('Linear CLI')
    .version('1.0.0');

  program
    .command('auth')
    .description('Authenticate with Linear using a personal access token')
    .argument('<token>', 'Linear personal access token')
    .action((token: string) => {
      authCommand(token);
    });

  program
    .command('search')
    .description('Search projects, issues, and documents')
    .argument('<query>', 'Search query')
    .action(async (query: string) => {
      await searchCommand(query);
    });

  const status = program.command('status').description('Manage task and project statuses');

  status
    .command('list')
    .description('List all task and project statuses')
    .action(async () => {
      await statusListCommand();
    });

  status
    .command('set')
    .description('Set status for a task or project')
    .argument('<id>', 'Task or Project ID')
    .argument('<status>', 'Status Name or ID')
    .action(async (id: string, statusInput: string) => {
      await statusSetCommand(id, statusInput);
    });

  const project = program.command('project').description('Manage Linear projects');

  project
    .command('list')
    .description('List all projects')
    .action(async () => {
      await projectListCommand();
    });

  project
    .command('show')
    .description('Show project details')
    .argument('<id>', 'Project ID')
    .action(async (id: string) => {
      await projectShowCommand(id);
    });

  project
    .command('create')
    .description('Create a new project')
    .argument('<name>', 'Project name')
    .argument('[teamId]', 'Team ID (optional if default is set)')
    .action(async (name: string, teamId?: string) => {
      await projectCreateCommand(name, teamId);
    });

  project
    .command('update')
    .description('Update a project')
    .argument('<id>', 'Project ID')
    .argument('<name>', 'New project name')
    .action(async (id: string, name: string) => {
      await projectUpdateCommand(id, name);
    });

  project
    .command('delete')
    .description('Delete a project')
    .argument('<id>', 'Project ID')
    .action(async (id: string) => {
      await projectDeleteCommand(id);
    });

  project
    .command('search')
    .description('Search projects by name')
    .argument('<query>', 'Search query')
    .action(async (query: string) => {
      await projectSearchCommand(query);
    });

  const task = program.command('task').description('Manage Linear tasks');

  task
    .command('list')
    .description('List all tasks')
    .option('-p, --project <id>', 'Filter tasks by project ID')
    .action(async (options: { project?: string }) => {
      await taskListCommand(options);
    });

  task
    .command('show')
    .description('Show task details')
    .argument('<id>', 'Task ID')
    .action(async (id: string) => {
      await taskShowCommand(id);
    });

  task
    .command('create')
    .description('Create a new task')
    .argument('<title>', 'Task title')
    .argument('[teamId]', 'Team ID (optional if default is set)')
    .option('-p, --project <id>', 'Project ID')
    .option('-d, --description <desc>', 'Task description')
    .action(async (title: string, teamId: string | undefined, options: { project?: string; description?: string }) => {
      await taskCreateCommand(title, teamId, options);
    });

  task
    .command('update')
    .description('Update a task')
    .argument('<id>', 'Task ID')
    .option('-t, --title <title>', 'New task title')
    .option('-d, --description <desc>', 'New task description')
    .action(async (id: string, options: { title?: string; description?: string }) => {
      await taskUpdateCommand(id, options);
    });

  task
    .command('delete')
    .description('Delete a task')
    .argument('<id>', 'Task ID')
    .action(async (id: string) => {
      await taskDeleteCommand(id);
    });

  const doc = program.command('doc').description('Manage Linear documents');

  doc
    .command('list')
    .description('List all documents')
    .option('-p, --project <id>', 'Filter documents by project ID')
    .action(async (options: { project?: string }) => {
      await docListCommand(options);
    });

  doc
    .command('show')
    .description('Show document details')
    .argument('<id>', 'Document ID')
    .action(async (id: string) => {
      await docShowCommand(id);
    });

  doc
    .command('create')
    .description('Create a new document')
    .argument('<title>', 'Document title')
    .argument('<projectId>', 'Project ID')
    .option('-c, --content <content>', 'Document content')
    .option('--create-from-file <path>', 'Path to a markdown file to use as content')
    .action(async (title: string, projectId: string, options: { content?: string; createFromFile?: string }) => {
      await docCreateCommand(title, projectId, options);
    });

  doc
    .command('update')
    .description('Update a document')
    .argument('<id>', 'Document ID')
    .option('-t, --title <title>', 'New document title')
    .option('-c, --content <content>', 'New document content')
    .action(async (id: string, options: { title?: string; content?: string }) => {
      await docUpdateCommand(id, options);
    });

  doc
    .command('delete')
    .description('Delete a document')
    .argument('<id>', 'Document ID')
    .action(async (id: string) => {
      await docDeleteCommand(id);
    });

  const team = program.command('team').description('Manage team settings');

  team
    .command('set-default')
    .description('Set a default team ID for create commands')
    .argument('<id>', 'Team ID')
    .action((id: string) => {
      const configService = new ConfigService();
      configService.setDefaultTeam(id);
      console.log(`Default team ID set to: ${id}`);
    });

  return program;
}

// Only run if this file is the main module
/* v8 ignore start */
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('linear')) {
  createProgram().parse(process.argv);
}
/* v8 ignore stop */