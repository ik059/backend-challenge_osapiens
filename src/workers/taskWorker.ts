import {AppDataSource} from '../data-source';
import {Task} from '../models/Task';
import {TaskRunner, TaskStatus} from './taskRunner';

export async function taskWorker() {
    const taskRepository = AppDataSource.getRepository(Task);
    const taskRunner = new TaskRunner(taskRepository);

    while (true) {
        const task = await taskRepository.findOne({
            where: { status: TaskStatus.Queued },
            relations: ['workflow'],
            order: { stepNumber: 'ASC'}
        });

        if (task) {
            try {
                if(task.dependsOn){
                    const dependencyTask = await taskRepository.findOne({
                        where:{
                            taskType: task.dependsOn,
                            workflow: {workflowId: task.workflow.workflowId}
                        },
                        relations:['workflow']
                    })
                    if(!dependencyTask || dependencyTask.status !== TaskStatus.Completed){
                        await new Promise(resolve => setTimeout(resolve, 5000))
                        continue;
                    }
                }
                await taskRunner.run(task);

            } catch (error) {
                console.error('Task execution failed. Task status has already been updated by TaskRunner.');
                console.error(error);
            }
        }

        // Wait before checking for the next task again
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}