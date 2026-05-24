import { Job } from './Job';
import { Task } from '../models/Task';
import { AppDataSource } from '../data-source';
import { TaskStatus } from '../workers/taskRunner'

export class ReportGenerationJob implements Job {
    async run(task: Task): Promise<any> {
        const taskRepository = AppDataSource.getRepository(Task);
        const allTasks = await taskRepository.find({
            where: { workflow: {workflowId: task.workflow.workflowId }}
        })

        const taskOutput = allTasks.filter(t => t.taskId !== task.taskId).map(t=>({
            taskId: t.taskId,
            type: t.taskType,
            output: t.output ? JSON.parse(t.output) : null,
            error: t.status === TaskStatus.Failed ? 'task failed' : undefined
        }))

        const returnObject:{
            workflowId: string,
            tasks: any[],
            finalReport: string
        } = {
            workflowId: task.workflow.workflowId,
            tasks: taskOutput,
            finalReport: "Aggregated data and results"
        }
        return returnObject;
    }
}