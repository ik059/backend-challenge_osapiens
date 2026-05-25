import { Router } from 'express';
import { AppDataSource } from '../data-source';
import { Workflow } from '../models/Workflow';
import { Task } from '../models/Task';
import { TaskStatus } from '../workers/taskRunner'
import { WorkflowStatus } from '../workflows/WorkflowFactory';
import { stat } from 'fs';

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
            return
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

router.get('/:id/results', async (req, res): Promise<void> =>{
    const { id } = req.params

    try{
        const existWorkflow = await workflowRepository.findOne({
            where:{
                workflowId: id
            }
        })

        if(!existWorkflow){
            res.status(404).json({message: "Workflow not found"})
            return
        }
        else if(existWorkflow.status !== WorkflowStatus.Completed){
            res.status(400).json({message:"Workflow is not completed yet"})
            return
        }
        else{
            const response = {
                "workflowId": existWorkflow.workflowId,
                "status": existWorkflow.status,
                "finalResult": existWorkflow.finalResult ? JSON.parse(existWorkflow.finalResult) : null
            }
            res.status(200).send(response)
        }
    }
    catch(error){
        console.log("Error in fetching results: ", error)
        res.status(500).json({message: "Internal server error"})
    }
})


export default router;