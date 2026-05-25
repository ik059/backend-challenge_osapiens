import request from 'supertest';
import express from 'express';
import { AppDataSource } from '../data-source';
import workflowRoutes from '../routes/workflowRoutes';
import analysisRoute from '../routes/analysisRoutes';

const app = express();
app.use(express.json());
app.use('/analysis', analysisRoute);
app.use('/workflow', workflowRoutes);

beforeAll(async ()=>{
    await AppDataSource.initialize()
})

afterAll(async ()=>{
    await AppDataSource.destroy()
})

describe('Workflow Routes', ()=>{
    let workflowId: string;

    it('should create a workflow', async ()=>{
        const response = await request(app).post('/analysis').send({  
            "clientId": "client123",
            "geoJson": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            -63.624885020050996,
                            -10.311050368263523
                        ],
                        [
                            -63.624885020050996,
                            -10.367865108370523
                        ],
                        [
                            -63.61278302732815,
                            -10.367865108370523
                        ],
                        [
                            -63.61278302732815,
                            -10.311050368263523
                        ],
                        [
                            -63.624885020050996,
                            -10.311050368263523
                        ]
                    ]
                ]
            }  
        })
        expect(response.status).toBe(202)
        expect(response.body).toHaveProperty('workflowId')
        workflowId = response.body.workflowId
    })

    it('should return 404 for non-existing workflow', async ()=>{
        const response = await request(app).get('/workflow/i_do_not_exist/status')

        expect(response.status).toBe(404)
        expect(response.body).toHaveProperty('message', 'Workflow not found')
    })

    it('should return the workflow status', async ()=>{
        const response = await request(app).get(`/workflow/${workflowId}/status`)

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('workflowId', workflowId)
        expect(response.body).toHaveProperty('status')
        expect(response.body).toHaveProperty('completedTasks')
        expect(response.body).toHaveProperty('totalTasks')
    })

    it('should return 404 for non-existing workflow results', async ()=>{
        const response = await request(app).get('/workflow/i_do_not_exist/results')

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'workflow ID does not exist')
    })

    it('should return 400 if the workflow is not completed', async ()=>{
        const response = await request(app).get(`/workflow/${workflowId}/results`)

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('message', 'Workflow is not yet completed')
    })

})