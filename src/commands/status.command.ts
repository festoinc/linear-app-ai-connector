import { LinearService } from '../services/linear.service.js';
import { ConfigService } from '../services/config.service.js';

export async function statusListCommand() {
  const configService = new ConfigService();
  const token = configService.getToken();

  if (!token) {
    console.error('Not authenticated. Please run "linear auth <token>" first.');
    return;
  }

  const linearService = new LinearService(token);

  try {
    const [workflowStates, projectStates] = await Promise.all([
      linearService.getWorkflowStates(),
      linearService.getProjectStates(),
    ]);

    console.log('\n--- Task Statuses ---');
    if (workflowStates.length === 0) {
      console.log('No task statuses found.');
    } else {
      workflowStates.forEach((s: any) => {
        console.log(`[${s.id}] ${s.name}`);
      });
    }

    console.log('\n--- Project Statuses ---');
    if (projectStates.length === 0) {
      console.log('No project statuses found.');
    } else {
      projectStates.forEach((s: any) => {
        console.log(`[${s.id}] ${s.name}`);
      });
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}

export async function statusSetCommand(id: string, statusInput: string) {
  const configService = new ConfigService();
  const token = configService.getToken();

  if (!token) {
    console.error('Not authenticated. Please run "linear auth <token>" first.');
    return;
  }

  const linearService = new LinearService(token);

  try {
    let entity: any;
    let type: 'task' | 'project';

    try {
      entity = await linearService.getIssue(id);
      type = 'task';
    } catch {
      try {
        entity = await linearService.getProject(id);
        type = 'project';
      } catch {
        console.error(`Entity with ID "${id}" not found.`);
        return;
      }
    }

    let statusId = statusInput;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(statusInput)) {
      if (type === 'task') {
        const states = await linearService.getWorkflowStates();
        const state = states.find((s: any) => s.name.toLowerCase() === statusInput.toLowerCase());
        if (state) {
          statusId = state.id;
        } else {
          console.error(`Status "${statusInput}" not found for tasks.`);
          return;
        }
      } else {
        const states = await linearService.getProjectStates();
        const state = states.find((s: any) => s.name.toLowerCase() === statusInput.toLowerCase());
        if (state) {
          statusId = state.id;
        } else {
          console.error(`Status "${statusInput}" not found for projects.`);
          return;
        }
      }
    }

    if (type === 'task') {
      await linearService.updateIssue(entity.id, { stateId: statusId });
    } else {
      await linearService.updateProject(entity.id, { statusId: statusId });
    }

    console.log(`Status updated successfully for ${type} ${id}.`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }
}