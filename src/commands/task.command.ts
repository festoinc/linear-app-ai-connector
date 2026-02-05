import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';

function getLinearService(): LinearService | null {
  const configService = new ConfigService();
  const token = configService.getToken();
  if (!token) {
    console.error('Error: Not authenticated. Please run "linear auth <token>" first.');
    return null;
  }
  return new LinearService(token);
}

export async function taskListCommand(options: { project?: string }): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    let filter: any = undefined;
    if (options.project) {
      filter = { project: { id: { eq: options.project } } };
    }

    const issues = await linearService.getIssues(filter);
    if (issues.length === 0) {
      console.log('No tasks found.');
      return;
    }

    console.log('Tasks:');
    issues.forEach((issue: any) => {
      console.log(`- [${issue.identifier}] ${issue.title} (${issue.id})`);
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function taskShowCommand(id: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const issue = await linearService.getIssue(id);
    if (!issue) {
      console.error(`Error: Task with ID "${id}" not found.`);
      return;
    }

    console.log(`Task: [${issue.identifier}] ${issue.title}`);
    console.log(`ID: ${issue.id}`);
    if (issue.description) {
      console.log(`Description: ${issue.description}`);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function taskCreateCommand(
  title: string,
  teamId?: string,
  options?: { project?: string; description?: string }
): Promise<void> {
  const configService = new ConfigService();
  const token = configService.getToken();
  if (!token) {
    console.error('Error: Not authenticated. Please run "linear auth <token>" first.');
    return;
  }

  const effectiveTeamId = teamId || configService.getDefaultTeam();
  if (!effectiveTeamId) {
    console.error('Error: Team ID is required. Either provide it as an argument or set a default using "linear team set-default <id>".');
    return;
  }

  const linearService = new LinearService(token);

  try {
    const resolvedTeamId = await linearService.getTeamId(effectiveTeamId);
    const input: any = {
      title,
      teamId: resolvedTeamId,
    };

    if (options?.project) {
      input.projectId = options.project;
    }
    if (options?.description) {
      input.description = options.description;
    }

    const issue = await linearService.createIssue(input);
    console.log(`Task [${issue.identifier}] "${issue.title}" created successfully.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function taskUpdateCommand(
  id: string,
  options: { title?: string; description?: string }
): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const input: any = {};
    if (options.title) input.title = options.title;
    if (options.description) input.description = options.description;

    if (Object.keys(input).length === 0) {
      console.error('Error: At least one property (title or description) must be provided to update.');
      return;
    }

    const issue = await linearService.updateIssue(id, input);
    console.log(`Task [${issue.identifier}] updated successfully.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function taskDeleteCommand(id: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    await linearService.deleteIssue(id);
    console.log(`Task with ID "${id}" deleted successfully.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}
