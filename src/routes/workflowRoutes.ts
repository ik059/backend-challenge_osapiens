import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Workflow } from '../models/Workflow';
import { Task } from '../models/Task';
import { TaskStatus } from '../workers/taskRunner'

const router = Router();
const workflowRepository = AppDataSource.getRepository(Workflow);

router.get('/:id/status', async (req, res): Promise<void> => {
    const { id } = req.params;

    try{
        const existWorkflow = await workflowRepository.findOne({
            where:{
                workflowId: id
            },
            relations:['tasks']
        })

        if(!existWorkflow){
            res.status(404).json({message: "Workflow not found"})
        }
        else{ 
            const completedTasks = existWorkflow.tasks.filter(t => t.status === TaskStatus.Completed).length;
            const totalTasks = existWorkflow.tasks.length

            const response = {
                workflowId : existWorkflow.workflowId,
                status : existWorkflow.status,
                completedTasks: completedTasks,
                totalTasks: totalTasks
            }

            res.status(200).send(response)
        }
    }
    catch(error){
        console.error("Error in fetching workflow status: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})


export default router;