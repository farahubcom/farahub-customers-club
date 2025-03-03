const { Module } = require('@farahub/framework/foundation');
const models = require('./models');
const schemas = require('./schemas');
const controllers = require('./controllers');
const hooks = require('./hooks');
const listeners = require('./listeners');
const conditions = require('./conditions');
const triggers = require('./triggers');
const sockets = require('./sockets');
const jobs = require('./jobs');


class CustomersClubModule extends Module {

    /**
     * The module name
     * 
     * @var string
     */
    name = 'Customers-Club';

    /**
     * The module base path
     * 
     * @var string
     */
    basePath = '/customers-club';

    /**
     * The module version
     * 
     * @var string
     */
    version = '1.0.0';

    /**
     * The module hooks
     * 
     * @var object
     */
    hooks = hooks;

    /**
     * The module conditions
     * 
     * @var array
     */
    conditions = conditions;

    /**
     * The module triggers
     * 
     * @var array
     */
    triggers = triggers;

    /**
     * The module jobs
     * 
     * @var array
     */
    jobs = jobs;

    /**
     * Register the module
     * 
     * @return void
     */
    register() {
        this.registerModels(models);
        this.registerSchemas(schemas);
        this.registerListeners(listeners)
        this.registerControllers(controllers);
    }

    /**
     * Boot the module
     * 
     * @return void
     */
    boot() {
        this.registerSockets(sockets);
    }

    /**
     * Run the module
     * 
     * @param Workspace workspace
     * @return void
     */
    async run(workspace) {
        //
    }
}

module.exports = CustomersClubModule;