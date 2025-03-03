const hooks = (module) => ({
	Authentication: {
		"main.createNew.preSave": ({ user, data }) => {
			user.references = [...user.references, new Date()];
		},
	},
});

module.exports = hooks;
