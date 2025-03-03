const { Controller } = require('@farahub/framework/foundation');
const { Injection, Validator, Event, Auth, Workspace, Lang } = require('@farahub/framework/facades');
const VisitCheckValidator = require('../validators/VisitCheckValidator');
const VisitStoreValidator = require('../validators/VisitStoreValidator');
const PersonVisitStored = require('../events/PersonVisitStored');


class VisitController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Visit';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/visit';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'post',
            path: '/check',
            handler: 'check',
        },
        {
            type: 'api',
            method: 'post',
            path: '/',
            handler: 'store',
        },
    ]

    /**
     * Check person details by number
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    check() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app, true),
            Injection.register(this.module, 'visit.check'),
            Validator.validate(new VisitCheckValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const Person = req.wsConnection.model('Person');

                    let person = await Person.findOne({ phone: data.phone }).lean({ virtuals: true });
                    if (person) {
                        person = Lang.translate(person);
                    }

                    return res.json({ ok: true, person });
                } catch (error) {
                    next(error);
                }
            }
        ]
    }

    /**
     * Store a new visit for person
     * 
     * @param {*} req request
     * @param {*} res response
     * 
     * @return void
     */
    store() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app, true),
            Injection.register(this.module, 'visit.store'),
            Validator.validate(new VisitStoreValidator()),
            Event.register(this.module),
            async function (req, res, next) {
                try {

                    const data = req.body;

                    const Person = req.wsConnection.model('Person');

                    const { wsConnection: connection, inject } = req;
                    let modified = await Person.findOne({ phone: data.phone });
                    if (!modified) {
                        modified = await Person.createOrUpdate({ phone: data.phone }, undefined, { connection, inject });
                    }
                    modified.references = [...modified.references, new Date];
                    await modified.save();

                    let person = await Person.findById(modified.id).lean({ virtuals: true });
                    person = Lang.translate(person);

                    res.json({ ok: true, person });

                    const { workspace, user } = req;
                    req.event(new PersonVisitStored(modified, workspace, connection));

                    await req.inject("postResponse", { person, inject, workspace, connection, user });

                    return;
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = VisitController;