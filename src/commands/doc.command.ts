import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';
import * as fs from 'fs';

function getLinearService(): LinearService | null {
  const configService = new ConfigService();
  const token = configService.getToken();
  if (!token) {
    console.error('Error: Not authenticated. Please run "linear auth <token>" first.');
    return null;
  }
  return new LinearService(token);
}

export async function docListCommand(options: { project?: string }): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    let filter: any = undefined;
    if (options.project) {
      filter = { project: { id: { eq: options.project } } };
    }

    const documents = await linearService.getDocuments(filter);
    if (documents.length === 0) {
      console.log('No documents found.');
      return;
    }

    console.log('Documents:');
    documents.forEach((doc: any) => {
      console.log(`- ${doc.title} (${doc.id})`);
    });
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function docShowCommand(id: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const doc = await linearService.getDocument(id);
    if (!doc) {
      console.error(`Error: Document with ID "${id}" not found.`);
      return;
    }

    console.log(`Document: ${doc.title}`);
    console.log(`ID: ${doc.id}`);
    if (doc.content) {
      console.log(`Content: ${doc.content}`);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function docCreateCommand(
  title: string,
  projectId: string,
  options?: { content?: string; createFromFile?: string }
): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const input: any = {
      title,
      projectId,
    };

    if (options?.createFromFile) {
      if (!fs.existsSync(options.createFromFile)) {
        console.error(`Error: File "${options.createFromFile}" does not exist.`);
        return;
      }
      input.content = fs.readFileSync(options.createFromFile, 'utf-8');
    } else if (options?.content) {
      input.content = options.content;
    }

    const doc = await linearService.createDocument(input);
    console.log(`Document "${doc.title}" created successfully with ID ${doc.id}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function docUpdateCommand(
  id: string,
  options: { title?: string; content?: string }
): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    const input: any = {};
    if (options.title) input.title = options.title;
    if (options.content) input.content = options.content;

    if (Object.keys(input).length === 0) {
      console.error('Error: At least one property (title or content) must be provided to update.');
      return;
    }

    const doc = await linearService.updateDocument(id, input);
    console.log(`Document "${doc.title}" updated successfully.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function docDeleteCommand(id: string): Promise<void> {
  const linearService = getLinearService();
  if (!linearService) return;

  try {
    await linearService.deleteDocument(id);
    console.log(`Document with ID "${id}" deleted successfully.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}
