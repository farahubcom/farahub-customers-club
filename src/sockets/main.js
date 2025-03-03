const { Socket } = require('@farahub/framework/foundation');


class MainSocket extends Socket {

    /**
     * The socket name
     * 
     * @var string
     */
    name = 'Main';

    /**
     * The socket events
     * 
     * @var array
     */
    events = [
        //
    ];

    //
}

module.exports = MainSocket;