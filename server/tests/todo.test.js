/*
    Tests taken from the todo-backend spec located at:
    https://github.com/TodoBackend/todo-backend-js-spec/blob/master/js/specs.js
    
    And transcribed from Mocha/Chai to Jest with async/await/promises and other ES6+ features
    for ease of extension of this project (any additional testing).
*/
process.env.NODE_ENV = 'test';
const _ = require("lodash");
const request = require('./util/httpRequests.js');
const organizations = require('../database/queries/organizations.js');
const projects = require('../database/queries/projects.js');

// Relative paths are used for supertest in the util file.
const urlFromTodo = todo => {
    const newUrl = new URL(todo.url, `${request.root}/todos`)
    return newUrl["pathname"]
};
const getRoot = _ => request.get('/todos');
const getBody = response => response.body;

let project = null
let organization = null

beforeEach(async () => {
    organization = await organizations.create({ name: 'Test Organization' });
    project = await projects.create({ name: 'Test Project', organization: organization.id });
});

describe(`Todo-Backend API residing at http://localhost:${process.env.PORT}/todos`, () => {
    function createFreshTodoAndGetItsUrl (params) {
        const postParams = _.defaults((params || {}), { title: "blah", organization: organization.id, project: project.id });
        return request.post('/todos', postParams).then(getBody).then(urlFromTodo);
    };

    describe("The pre-requsites", () => {
        it("the api root responds to a GET (i.e. the server is up and accessible, CORS headers are set up)",
            async () => {
                const response = await request.get('/todos');
                expect(response.status).toBe(200);
            }
        );

        it("the api root responds to a POST with the todo which was posted to it", async () => {
            expect(organization.id).toBeDefined();
            const starting = { "title": "a todo", organization: organization.id, project: project.id };
            const getRoot = await request.post('/todos', starting).then(getBody);
            expect(getRoot).toMatchObject(expect.objectContaining(starting));
        });

    });

    describe("storing new todos by posting to the root url", () => {
        beforeEach(async () => {
            return await request.delete("/todos");
        });

        it("adds a new todo to the list of todos at the root url", async () => {
            const starting = { title: "walk the dog 2", description: "walk the dog!", organization: organization.id, project: project.id };
            const getAfterPost = await request.post('/todos', starting).then(getRoot).then(getBody);

            expect(getAfterPost.length).toBeGreaterThan(0);

            const createdTodo = getAfterPost.find(todo => todo.title === starting.title)

            expect(createdTodo).toMatchObject(expect.objectContaining({
                code: createdTodo.code,
                description: starting.description,
                title: starting.title,
                organization: starting.organization,
                status: 'created',
                project: starting.project,
                url: createdTodo.url
            }));
        });

        function createTodoAndVerifyItLooksValidWith (verifyTodoExpectation) {
            return request.post('/todos', { title: "blah", organization: organization.id, project: project.id })
                .then(getBody)
                .then(verifyTodoExpectation)
                .then(getRoot)
                .then(getBody)
        }

        it("sets up a new todo as initially created", async () => {
            await createTodoAndVerifyItLooksValidWith((todo) => {
                expect(todo.status).toBe('created');
                expect(todo.title).toBe('blah');
                expect(todo.organization).toBe(organization.id);
                expect(todo.project).toBe(project.id);
                return todo;
            });
        });

        it("each new todo has a url", async () => {
            await createTodoAndVerifyItLooksValidWith((todo) => {
                expect(todo).toHaveProperty("url");
                expect(typeof todo["url"]).toBe("string");
                return todo;
            });
        });

        it("each new todo has a url, which returns a todo", async () => {
            const starting = { title: "my todo", organization: organization.id, project: project.id };
            const newTodo = await request.post('/todos', starting).then(getBody);
            const fetchedTodo = await request.get(urlFromTodo(newTodo)).then(getBody);
            expect(fetchedTodo).toMatchObject(expect.objectContaining(starting));
        });
    });

    describe("working with an existing todo", () => {
        beforeEach(async () => {
            return await request.delete('/');
        });

        it("can navigate from a list of todos to an individual todo via urls", async () => {
            const makeTwoTodos =
                Promise.all(
                    [
                        request.post('/todos', { title: "todo the first" }),
                        request.post('/todos', { title: "todo the second" })
                    ]
                );

            const todoList = await makeTwoTodos.then(getRoot).then(getBody);
            expect(todoList.length).toBe(1);
            const getAgainstUrlOfFirstTodo = await request.get(urlFromTodo(todoList[0])).then(getBody);
            expect(getAgainstUrlOfFirstTodo).toHaveProperty("title");
        });

        it("can change the todo's title by PATCHing to the todo's url", async () => {
            const initialTitle = { title: "initial title" };
            const todoUrl = await createFreshTodoAndGetItsUrl(initialTitle);
            const changedTitle = { title: "bathe the cat" };
            const patchedTodo = await request.patch(todoUrl, changedTitle).then(getBody);
            expect(patchedTodo).toMatchObject(expect.objectContaining(changedTitle));
            expect(patchedTodo).not.toMatchObject(expect.objectContaining(initialTitle));
        });

        it("can change the todo's completedness by PATCHing to the todo's url", async () => {
            const urlForNewTodo = await createFreshTodoAndGetItsUrl()
            const patchedTodo = await request.patch(urlForNewTodo, { organization: "97ee8f56-c197-4dd0-8a42-179ccad0b590", status: 'completed' }).then(getBody);
            expect(patchedTodo).toHaveProperty("status", "completed");
        });

        it("changes to a todo are persisted and show up when re-fetching the todo", async () => {
            const urlForNewTodo = await createFreshTodoAndGetItsUrl()

            const patchedTodo = await request.patch(urlForNewTodo, { title: "changed title", organization: "97ee8f56-c197-4dd0-8a42-179ccad0b590", status: 'completed' }).then(getBody);

            expect(patchedTodo.status).toBe('completed');

            function verifyTodosProperties (todo) {
                expect(todo).toHaveProperty("status", "completed");
                expect(todo).toHaveProperty("organization", "97ee8f56-c197-4dd0-8a42-179ccad0b590");
                expect(todo).toHaveProperty("title", "changed title");
            }

            const verifyRefetchedTodo = request.get(urlFromTodo(patchedTodo))
                .then(getBody)
                .then((refetchedTodo) => {
                    expect(refetchedTodo.status).toBe('completed');
                    verifyTodosProperties(refetchedTodo);
                });

            await Promise.all([
                verifyRefetchedTodo,
            ]);
        });

        it("can delete a todo making a DELETE request to the todo's url", async () => {
            const urlForNewTodo = await createFreshTodoAndGetItsUrl();
            await request.delete(urlForNewTodo);
            const todosAfterCreatingAndDeletingTodo = await request.get(urlForNewTodo).then(getBody);
            expect(todosAfterCreatingAndDeletingTodo.status).toEqual('deleted');
        });

        it('returns todos by project id', async () => {
            const starting = { title: "walk the dog 2", description: "walk the dog!", organization: organization.id, project: project.id };
            await request.post('/todos', starting).then(getRoot).then(getBody);

            const urlForNewTodo = await createFreshTodoAndGetItsUrl()
            const todoId = urlForNewTodo.split('/').pop()
            const todosByproject = await request.get(`/todos/projects/${project.id}`).then(getBody);
            
            const matchingTodo = todosByproject.find(todo => todo.id === todoId)
            expect(todosByproject.length).toBeGreaterThan(0);
            expect(matchingTodo.id).toBe(todoId);
        });
    });
});