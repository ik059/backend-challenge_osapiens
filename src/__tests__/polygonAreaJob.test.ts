import { PolygonAreaJob } from '../jobs/PolygonAreaJob';
import { Task } from '../models/Task';
import { TaskStatus } from '../workers/taskRunner'

describe('PolygonAreaJob', ()=>{
    let job: PolygonAreaJob;

    beforeEach(()=>{
        job = new PolygonAreaJob()
    })

    it('should calculate area for valid GeoJSON', async ()=>{
        const task = {
            "clientId": "client123",
            "geoJson": JSON.stringify({
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
            })
        } as Task
        const result = await job.run(task)

        expect(result).toHaveProperty("area");
        expect(result).toHaveProperty("unit", "square meters");
        expect(result.area).toBeGreaterThan(0)
    });

    it('should throw error for invalid GeoJson', async ()=>{
        const task = {
            taskId : "client123",
            taskType: "polygonArea",
            status: TaskStatus.Queued,
            geoJson: 'random invalid json'
        } as Task;
        
        await expect(job.run(task)).rejects.toThrow('Invalid GeoJSON');
    })

})