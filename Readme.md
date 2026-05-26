# Backend Coding Challenge

This repository demonstrates a backend architecture that handles asynchronous tasks, workflows, and job execution using TypeScript, Express.js, and TypeORM. The project showcases how to:

- Define and manage entities such as `Task` and `Workflow`.
- Use a `WorkflowFactory` to create workflows from YAML configurations.
- Implement a `TaskRunner` that executes jobs associated with tasks and manages task and workflow states.
- Run tasks asynchronously using a background worker.

## Key Features

1. **Entity Modeling with TypeORM**  
   - **Task Entity:** Represents an individual unit of work with attributes like `taskType`, `status`, `progress`, and references to a `Workflow`.
   - **Workflow Entity:** Groups multiple tasks into a defined sequence or steps, allowing complex multi-step processes.

2. **Workflow Creation from YAML**  
   - Use `WorkflowFactory` to load workflow definitions from a YAML file.
   - Dynamically create workflows and tasks without code changes by updating YAML files.

3. **Asynchronous Task Execution**  
   - A background worker (`taskWorker`) continuously polls for `queued` tasks.
   - The `TaskRunner` runs the appropriate job based on a task’s `taskType`.

4. **Robust Status Management**  
   - `TaskRunner` updates the status of tasks (from `queued` to `in_progress`, `completed`, or `failed`).
   - Workflow status is evaluated after each task completes, ensuring you know when the entire workflow is `completed` or `failed`.

5. **Dependency Injection and Decoupling**  
   - `TaskRunner` takes in only the `Task` and determines the correct job internally.
   - `TaskRunner` handles task state transitions, leaving the background worker clean and focused on orchestration.

## Project Structure

```
src
├─ models/
│   ├─ world_data.json  # Contains world data for analysis
│   
├─ models/
│   ├─ Result.ts        # Defines the Result entity
│   ├─ Task.ts          # Defines the Task entity
│   ├─ Workflow.ts      # Defines the Workflow entity
│   
├─ jobs/
│   ├─ Job.ts           # Job interface
│   ├─ JobFactory.ts    # getJobForTaskType function for mapping taskType to a Job
│   ├─ TaskRunner.ts    # Handles job execution & task/workflow state transitions
│   ├─ DataAnalysisJob.ts (example)
│   ├─ EmailNotificationJob.ts (example)
│
├─ workflows/
│   ├─ WorkflowFactory.ts  # Creates workflows & tasks from a YAML definition
│
├─ workers/
│   ├─ taskWorker.ts    # Background worker that fetches queued tasks & runs them
│
├─ routes/
│   ├─ analysisRoutes.ts # POST /analysis endpoint to create workflows
│
├─ data-source.ts       # TypeORM DataSource configuration
└─ index.ts             # Express.js server initialization & starting the worker
```

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- SQLite or another supported database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ik059/backend-challenge_osapiens.git
   cd backend-challenge_osapiens
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure TypeORM:**
    - Edit `data-source.ts` to ensure the `entities` array includes `Task` and `Workflow` entities.
    - Confirm database settings (e.g. SQLite file path).

4. **Create or Update the Workflow YAML:**
    - Place a YAML file (e.g. `example_workflow.yml`) in a `workflows/` directory.
    - Define steps, for example:
      ```yaml
      name: "example_workflow"
      steps:
        - taskType: "analysis"
          stepNumber: 1
        - taskType: "notification"
          stepNumber: 2
      ```

### Running the Application

1. **Compile TypeScript (optional if using `ts-node`):**
   ```bash
   npx tsc
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   If using `ts-node`, this will start the Express.js server and the background worker after database initialization.

3. **Create a Workflow (e.g. via `/analysis`):**
   ```bash
   curl -X POST http://localhost:3000/analysis \
   -H "Content-Type: application/json" \
   -d '{
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
    }'
   ```

   This will read the configured workflow YAML, create a workflow and tasks, and queue them for processing.

4. **Check Logs:**
    - The worker picks up tasks from `queued` state.
    - `TaskRunner` runs the corresponding job (e.g., data analysis, email notification) and updates states.
    - Once tasks are done, the workflow is marked as `completed`.


### **Coding Challenge Tasks for the Interviewee**

The following tasks must be completed to enhance the backend system:

---

### **1. Add a New Job to Calculate Polygon Area**
**Objective:**  
Create a new job class to calculate the area of a polygon from the GeoJSON provided in the task.

#### **Steps:**
1. Create a new job file `PolygonAreaJob.ts` in the `src/jobs/` directory.
2. Implement the `Job` interface in this new class.
3. Use `@turf/area` to calculate the polygon area from the `geoJson` field in the task.
4. Save the result in the `output` field of the task.

#### **Requirements:**
- The `output` should include the calculated area in square meters.
- Ensure that the job handles invalid GeoJSON gracefully and marks the task as failed.

---

### **2. Add a Job to Generate a Report**
**Objective:**  
Create a new job class to generate a report by aggregating the outputs of multiple tasks in the workflow.

#### **Steps:**
1. Create a new job file `ReportGenerationJob.ts` in the `src/jobs/` directory.
2. Implement the `Job` interface in this new class.
3. Aggregate outputs from all preceding tasks in the workflow into a JSON report. For example:
   ```json
   {
       "workflowId": "<workflow-id>",
       "tasks": [
           { "taskId": "<task-1-id>", "type": "polygonArea", "output": "<area>" },
           { "taskId": "<task-2-id>", "type": "dataAnalysis", "output": "<analysis result>" }
       ],
       "finalReport": "Aggregated data and results"
   }
   ```
4. Save the report as the `output` of the `ReportGenerationJob`.

#### **Requirements:**
- Ensure the job runs only after all preceding tasks are complete.
- Handle cases where tasks fail, and include error information in the report.

---

### **3. Support Interdependent Tasks in Workflows**
**Objective:**  
Modify the system to support workflows with tasks that depend on the outputs of earlier tasks.

#### **Steps:**
1. Update the `Task` entity to include a `dependency` field that references another task
2. Modify the `TaskRunner` to wait for dependent tasks to complete and pass their outputs as inputs to the current task.
3. Extend the workflow YAML format to specify task dependencies (e.g., `dependsOn`).
4. Update the `WorkflowFactory` to parse dependencies and create tasks accordingly.

#### **Requirements:**
- Ensure dependent tasks do not execute until their dependencies are completed.
- Test workflows where tasks are chained through dependencies.

---

### **4. Ensure Final Workflow Results Are Properly Saved**
**Objective:**  
Save the aggregated results of all tasks in the workflow as the `finalResult` field of the `Workflow` entity.

#### **Steps:**
1. Modify the `Workflow` entity to include a `finalResult` field:
2. Aggregate the outputs of all tasks in the workflow after the last task completes.
3. Save the aggregated results in the `finalResult` field.

#### **Requirements:**
- The `finalResult` must include outputs from all completed tasks.
- Handle cases where tasks fail, and include failure information in the final result.

---

### **5. Create an Endpoint for Getting Workflow Status**
**Objective:**  
Implement an API endpoint to retrieve the current status of a workflow.

#### **Endpoint Specification:**
- **URL:** `/workflow/:id/status`
- **Method:** `GET`
- **Response Example:**
   ```json
   {
       "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
       "status": "in_progress",
       "completedTasks": 3,
       "totalTasks": 5
   }
   ```

#### **Requirements:**
- Include the number of completed tasks and the total number of tasks in the workflow.
- Return a `404` response if the workflow ID does not exist.

---

### **6. Create an Endpoint for Retrieving Workflow Results**
**Objective:**  
Implement an API endpoint to retrieve the final results of a completed workflow.

#### **Endpoint Specification:**
- **URL:** `/workflow/:id/results`
- **Method:** `GET`
- **Response Example:**
   ```json
   {
       "workflowId": "3433c76d-f226-4c91-afb5-7dfc7accab24",
       "status": "completed",
       "finalResult": "Aggregated workflow results go here"
   }
   ```

#### **Requirements:**
- Return the `finalResult` field of the workflow if it is completed.
- Return a `404` response if the workflow ID does not exist.
- Return a `400` response if the workflow is not yet completed.

---

### **Deliverables**
- **Code Implementation:**
   - New jobs: `PolygonAreaJob` and `ReportGenerationJob`.
   - Enhanced workflow support for interdependent tasks.
   - Workflow final results aggregation.
   - New API endpoints for workflow status and results.

- **Documentation:**
   - Update the README file to include instructions for testing the new features.
   - Document the API endpoints with request and response examples.

### Running the test cases
```
npm test
```

### Test cases
- `PolygonAreaJob` - calculate the polygon area from GeoJSON
- `ReportGenerationJob` - prepare all task outputs into a report
- Workflow API endpoints - status and results

### API Documentation

#### 1. Create a Workflow
- **URL:** `POST /analysis`
- **Request Body**
```json
{
  "clientId": "client123",
  "geoJson": {
    "type": "Feature",
    "geometry": {
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
  }
}
```
- **Response**
```json
{
    "workflowId":"035e8c8a-12b7-4aa4-9eb6-ee92edf342e6",
    "message": "Workflow created and tasks queued from YAML definition."
}
```
- **Errors**
    - `500` - Failed to create workflow
#### 2. Get Workflow Status
- **URL:** `GET /workflow/:id/status`
- **Response:**
```json
{
    "workflowId":"035e8c8a-12b7-4aa4-9eb6-ee92edf342e6",
    "status":"completed",
    "completedTasks":4,
    "totalTasks":4
}
```
- **Errors:**
  - `404` — Workflow not found

#### 3. Get Workflow Results
- **URL:** `GET /workflow/:id/results`
- **Response:**
```json
{
  "workflowId": "035e8c8a-12b7-4aa4-9eb6-ee92edf342e6",
  "status": "completed",
  "finalResult": {
    "tasks": [
      {
        "taskID": "11ddb2ed-5286-4194-b5cb-aa4f8c1cfe31",
        "type": "polygonArea",
        "output": {
          "area": 8363324.273315565,
          "unit": "square meters"
        },
        "status": "completed"
      },
      {
        "taskID": "40d33866-9b4e-4335-be0b-297d02360be1",
        "type": "dataAnalysis",
        "output": "Brazil",
        "status": "completed"
      },
      {
        "taskID": "a1a74751-18d2-40a4-9498-c8c0bf6d75e9",
        "type": "notification",
        "output": {},
        "status": "completed"
      },
      {
        "taskID": "6991c560-a80d-4c20-ba44-a0df220aa5d7",
        "type": "report",
        "output": {
          "workflowId": "035e8c8a-12b7-4aa4-9eb6-ee92edf342e6",
          "tasks": [
            {
              "taskId": "11ddb2ed-5286-4194-b5cb-aa4f8c1cfe31",
              "type": "polygonArea",
              "output": {
                "area": 8363324.273315565,
                "unit": "square meters"
              }
            },
            {
              "taskId": "40d33866-9b4e-4335-be0b-297d02360be1",
              "type": "dataAnalysis",
              "output": "Brazil"
            },
            {
              "taskId": "a1a74751-18d2-40a4-9498-c8c0bf6d75e9",
              "type": "notification",
              "output": {}
            }
          ],
          "finalReport": "Aggregated data and results"
        },
        "status": "completed"
      }
    ]
  }
}
```
- **Errors:**
  - `404` — Workflow not found
  - `400` — Workflow is not yet completed


---

