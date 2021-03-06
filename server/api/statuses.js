'use strict';

const Boom = require('boom');
const Joi = require('joi');
const Preware = require('../preware');
const Status = require('../models/status');


const register = function (server, serverOptions) {

    server.route({
        method: 'GET',
        path: '/api/statuses',
        options: {
            tags: ['api','statuses'],
            description: 'Get a paginated list of all statuses. [Root Scope]',
            notes: 'Get a paginated list of all statuses.',
            auth: {
                scope: 'admin'
            },
            validate: {
                query: {
                    sort: Joi.string().default('_id'),
                    limit: Joi.number().default(20),
                    page: Joi.number().default(1)
                }
            },
            pre: [
                Preware.requireAdminGroup('root')
            ]
        },
        handler: async function (request, h) {

            const query = {};
            const limit = request.query.limit;
            const page = request.query.page;
            const options = {
                sort: Status.sortAdapter(request.query.sort)
            };

            return await Status.pagedFind(query, limit, page, options);
        }
    });


    server.route({
        method: 'POST',
        path: '/api/statuses',
        options: {
            tags: ['api','statuses'],
            description: 'Add a new status. [Root Scope]',
            notes: 'Add a new status.',
            auth: {
                scope: 'admin'
            },
            validate: {
                payload: {
                    name: Joi.string().required(),
                    pivot: Joi.string().required()
                }
            },
            pre: [
                Preware.requireAdminGroup('root')
            ]
        },
        handler: async function (request, h) {

            return await Status.create(request.payload.pivot, request.payload.name);
        }
    });


    server.route({
        method: 'GET',
        path: '/api/statuses/{id}',
        options: {
            tags: ['api','statuses'],
            description: 'Get a status by ID. [Root Scope]',
            notes: 'Get a status by ID.',
            validate: {
                params: {
                    id : Joi.string().required().description('the id to get status')
                }
            },
            auth: {
                scope: 'admin'
            },
            pre: [
                Preware.requireAdminGroup('root')
            ]
        },
        handler: async function (request, h) {

            const status = await Status.findById(request.params.id);

            if (!status) {
                throw Boom.notFound('Status not found.');
            }

            return status;
        }
    });


    server.route({
        method: 'PUT',
        path: '/api/statuses/{id}',
        options: {
            tags: ['api','statuses'],
            description: 'Update a status by ID. [Root Scope]',
            notes: 'Update a status by ID.',
            auth: {
                scope: 'admin'
            },
            validate: {
                payload: {
                    name: Joi.string().required()
                },
                params: {
                    id : Joi.string().required().description('the id to update a status')
                }
            },
            pre: [
                Preware.requireAdminGroup('root')
            ]
        },
        handler: async function (request, h) {

            const id = request.params.id;
            const update = {
                $set: {
                    name: request.payload.name
                }
            };
            const status = await Status.findByIdAndUpdate(id, update);

            if (!status) {
                throw Boom.notFound('Status not found.');
            }

            return status;
        }
    });


    server.route({
        method: 'DELETE',
        path: '/api/statuses/{id}',
        options: {
            tags: ['api','statuses'],
            description: 'Delete a status by ID. [Root Scope]',
            notes: 'Delete a status by ID.',
            validate: {
                params: {
                    id : Joi.string().required().description('the id to delete a status')
                }
            },
            auth: {
                scope: 'admin'
            },
            pre: [
                Preware.requireAdminGroup('root')
            ]
        },
        handler: async function (request, h) {

            const status = await Status.findByIdAndDelete(request.params.id);

            if (!status) {
                throw Boom.notFound('Status not found.');
            }

            return { message: 'Success.' };
        }
    });
};


module.exports = {
    name: 'api-statuses',
    dependencies: [
        'auth',
        'hapi-auth-basic',
        'hapi-mongo-models'
    ],
    register
};
