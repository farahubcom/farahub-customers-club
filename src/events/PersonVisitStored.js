class PersonVisitStored {

    /**
     * Visited person
     * 
     * @var Person
     */
    person;

    /**
     * The workspace instance
     * 
     * @var Workspace
     */
    workspace;

    /**
     * Workspace connection
     * 
     * @var Connection
     */
    connection;

    /**
     * Create event instance
     * 
     * @constructor
     * @param {Person} person Visited person
     * @param {Workspaec} workspace Workspace
     * @param {Connection} connection Workspace connection
     */
    constructor(person, workspace, connection) {
        this.person = person;
        this.workspace = workspace;
        this.connection = connection;
    }
}

module.exports = PersonVisitStored;