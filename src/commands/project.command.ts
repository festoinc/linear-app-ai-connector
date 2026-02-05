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

export async function projectListCommand(): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const projects = await linearService.getProjects();
    if (projects.length === 0) {
      console.log('No projects found.');
      return;
    }

    console.log('Projects:');
    projects.forEach((p: any) => {
      console.log(`- ${p.name} (${p.id}) [${p.slugId}]`);
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function projectShowCommand(id: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const project = await linearService.getProject(id);
    if (!project) {
      console.error(`Error: Project with ID "${id}" not found.`);
      return;
    }

    console.log(`Project: ${project.name}`);
    console.log(`ID: ${project.id}`);
    console.log(`Slug: ${project.slugId}`);
    if (project.description) {
      console.log(`Description: ${project.description}`);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function projectCreateCommand(name: string, teamId?: string): Promise<void> {
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
    const project = await linearService.createProject({ name, teamIds: [resolvedTeamId] });
    console.log(`Project "${project.name}" created successfully with ID ${project.id} [${project.slugId}]`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function projectUpdateCommand(id: string, name: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const project = await linearService.updateProject(id, { name });
    console.log(`Project "${project.name}" updated successfully.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function projectDeleteCommand(id: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    await linearService.deleteProject(id);
    console.log(`Project with ID "${id}" deleted successfully.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function projectSearchCommand(query: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const projects = await linearService.searchProjects(query);
    if (projects.length === 0) {
      console.log(`No projects found matching "${query}".`);
      return;
    }

    console.log(`Projects matching "${query}":`);
    projects.forEach((p: any) => {
      console.log(`- ${p.name} (${p.id}) [${p.slugId}]`);
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}
