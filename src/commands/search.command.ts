import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';

export async function searchCommand(query: string) {
  const configService = new ConfigService();
  const token = configService.getToken();

  if (!token) {
    console.error('Not authenticated. Please run "linear auth <token>" first.');
    return;
  }

  const linearService = new LinearService(token);

  try {
    const [projects, issues, documents] = await Promise.all([
      linearService.searchProjects(query),
      linearService.searchIssues(query),
      linearService.searchDocuments(query),
    ]);

    console.log(`
--- Projects ---`);
    if (projects.length === 0) {
      console.log('No projects found.');
    } else {
      projects.forEach((p: any) => {
        console.log(`[${p.id}] ${p.name}`);
      });
    }

    console.log(`
--- Issues ---`);
    if (issues.length === 0) {
      console.log('No issues found.');
    } else {
      issues.forEach((i: any) => {
        console.log(`[${i.id}] ${i.identifier}: ${i.title}`);
      });
    }

    console.log(`
--- Documents ---`);
    if (documents.length === 0) {
      console.log('No documents found.');
    } else {
      documents.forEach((d: any) => {
        console.log(`[${d.id}] ${d.title}`);
      });
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}
