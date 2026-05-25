import { ReportGenerationJob } from '../jobs/ReportGenerationJob';
import { AppDataSource } from '../data-source';
import { Task } from '../models/Task';
import { Workflow } from '../models/Workflow';
import { TaskStatus } from '../workers/taskRunner';
import { WorkflowStatus } from '../workflows/WorkflowFactory';

beforeAll(async ()=>{
    await AppDataSource.initialize()
})

afterAll(async ()=>{
    await AppDataSource.destroy()
})

describe('ReportGenerationJob', ()=>{
    let job: ReportGenerationJob;
    let workflow: Workflow;
    let reportTask: Task;

    beforeEach(async ()=>{
        job = new ReportGenerationJob()

        const workflowRepository = AppDataSource.getRepository(Workflow)
        workflow = new Workflow()
        workflow.clientId = 'test-client';
        workflow.status = WorkflowStatus.Initial;
        await workflowRepository.save(workflow)

        const taskRepository = AppDataSource.getRepository(Task)

        const task1 = new Task()
        task1.clientId = 'test-client';
        task1.taskType = 'polygonArea';
        task1.status = TaskStatus.Completed;
        task1.geoJson = '{}';
        task1.output = JSON.stringify({area: 125000, unit: 'square meters'})
        task1.workflow = workflow
        await taskRepository.save(task1)

        const task2 = new Task()
        task2.clientId = 'test-client';
        task2.taskType = 'dataAnalysis';
        task2.status = TaskStatus.Completed;
        task2.geoJson = '{}'
        task2.output = JSON.stringify('Brazil');
        task2.workflow = workflow;
        await taskRepository.save(task2)

        reportTask = new Task()
        reportTask.clientId = 'test-client';
        reportTask.taskType = 'report';
        reportTask.status = TaskStatus.Queued;
        reportTask.geoJson = '{}';
        reportTask.workflow = workflow;
        await taskRepository.save(reportTask)
    })

    it('should generate a report with all task outputs', async ()=>{
        const result = await job.run(reportTask);

        expect(result).toHaveProperty('workflowId', workflow.workflowId);
        expect(result).toHaveProperty('tasks');
        expect(result).toHaveProperty('finalReport');
        expect(result.tasks.length).toBe(2)
    })

    it('should not include report task in the output', async ()=>{
        const result = await job.run(reportTask);

        const reportTaskInResult = result.tasks.find(
            (t:any)=>t.type === 'report'
        )

        expect(reportTaskInResult).toBeUndefined()
    })
})
