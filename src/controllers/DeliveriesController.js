const { Controller } = require('@farahub/framework/foundation');
const { Injection, Auth, Workspace, Lang } = require('@farahub/framework/facades');


class DeliveriesController extends Controller {

    /**
     * The controller name
     * 
     * @var string
     */
    name = 'Deliveries';

    /**
     * The controller base path
     * 
     * @var string
     */
    basePath = '/deliveries';

    /**
     * The controller routes
     * 
     * @var array
     */
    routes = [
        {
            type: 'api',
            method: 'get',
            path: '/',
            handler: 'list',
        },
    ]

    /**
     * List of deliveries match params
     * 
     * @return void
     */
    list() {
        return [
            Auth.authenticate('jwt', { session: false }),
            Workspace.resolve(this.app),
            Injection.register(this.module, 'deliveries.list'),
            async (req, res, next) => {
                try {

                    const { wsConnection: connection } = req;

                    const Delivery = connection.model('Delivery');

                    const args = req.query;

                    let search = {
                        //
                    }

                    if (args && args.query && args.query !== '') {
                        search = {
                            ...search,
                            name: { $regex: args.query + '.*' }
                        }
                    }

                    const sort = args && args.sort ? args.sort : "-createdAt";

                    const populationInjections = await req.inject('populate');

                    const query = Delivery.find(search)
                        .select('-__v')
                        .populate([
                            { path: 'message' },
                            { path: 'to' },
                            ...(populationInjections || [])
                        ]);

                    query.sort(sort);

                    const total = await Delivery.find(search).count();

                    if (args && args.page > -1) {
                        const perPage = args.perPage || 25;
                        query.skip(args.page * perPage)
                            .limit(perPage)
                    }

                    let data = await query.lean({ virtuals: true });

                    data = Lang.translate(data);

                    return res.json({ ok: true, data, total })
                } catch (error) {
                    next(error);
                }
            }
        ]
    }
}

module.exports = DeliveriesController;