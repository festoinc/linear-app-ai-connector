import { LinearClient } from '@linear/sdk';

export class LinearService {
  private client: LinearClient;

  constructor(apiKey: string) {
    this.client = new LinearClient({ apiKey });
  }

  async getProjects() {
    const projects = await this.client.projects();
    return projects.nodes;
  }

  async getProject(id: string) {
    return this.client.project(id);
  }

  async createProject(input: any) {
    const response = await this.client.createProject(input);
    const project = await response.project;
    if (!project) {
      throw new Error('Failed to create project');
    }
    return project;
  }

  async updateProject(id: string, input: any) {
    const response = await this.client.updateProject(id, input);
    const project = await response.project;
    if (!project) {
      throw new Error('Failed to update project');
    }
    return project;
  }

  async deleteProject(id: string) {
    await this.client.archiveProject(id);
  }

  async getWorkflowStates() {
    const states = await this.client.workflowStates();
    return states.nodes;
  }

  async getProjectStates() {
    const states = await this.client.projectStatuses();
    return states.nodes;
  }

  async searchProjects(query: string) {
    const projects = await this.client.projects({
      filter: { name: { contains: query } }
    });
    return projects.nodes;
  }

  async searchIssues(query: string) {
    const issues = await this.client.issues({
      filter: { 
        or: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      }
    });
    return issues.nodes;
  }

  async searchDocuments(query: string) {
    const documents = await this.client.documents({
      filter: { title: { contains: query } }
    });
    return documents.nodes;
  }

  async getTeamId(identifier: string): Promise<string> {
    // Check if it's already a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(identifier)) {
      return identifier;
    }

    // Otherwise, try to find team by key
    const teams = await this.client.teams({
      filter: { key: { eq: identifier.toUpperCase() } }
    });

    if (teams.nodes.length === 0) {
      throw new Error(`Team with key "${identifier}" not found.`);
    }

    return teams.nodes[0].id;
  }

  async getIssues(filter?: any) {
    const issues = await this.client.issues(filter ? { filter } : undefined);
    return issues.nodes;
  }

  async getIssue(id: string) {
    return this.client.issue(id);
  }

  async createIssue(input: any) {
    const response = await this.client.createIssue(input);
    const issue = await response.issue;
    if (!issue) {
      throw new Error('Failed to create issue');
    }
    return issue;
  }

  async updateIssue(id: string, input: any) {
    const response = await this.client.updateIssue(id, input);
    const issue = await response.issue;
    if (!issue) {
      throw new Error('Failed to update issue');
    }
    return issue;
  }

  async deleteIssue(id: string) {
    await this.client.archiveIssue(id);
  }

  async getDocuments(filter?: any) {
    const documents = await this.client.documents(filter ? { filter } : undefined);
    return documents.nodes;
  }

  async getDocument(id: string) {
    return this.client.document(id);
  }

  async createDocument(input: any) {
    const response = await this.client.createDocument(input);
    const document = await response.document;
    if (!document) {
      throw new Error('Failed to create document');
    }
    return document;
  }

  async updateDocument(id: string, input: any) {
    const response = await this.client.updateDocument(id, input);
    const document = await response.document;
    if (!document) {
      throw new Error('Failed to update document');
    }
    return document;
  }

  async deleteDocument(id: string) {
    await this.client.deleteDocument(id);
  }
}