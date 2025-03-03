const { toLower } = require("lodash");
const pick = require("lodash/pick");

class Campaign {
	/**
	 * Create new or update an exsiting campaign
	 *
	 * @param {Object} data data
	 * @param {string} campaignId updating campaign
	 * @param {Object} request request object
	 * @returns modified product
	 */
	static async createOrUpdate(data, campaignId, { connection, inject }) {
		try {
			const Campaign = this.model("Campaign");

			// create or get instance
			const campaign = campaignId
				? await Campaign.findById(campaignId).poulate('message')
				: new Campaign();

			// assign other fields
			Object.keys(
				pick(data, ["constraints"])
			).forEach((key) => {
				campaign[key] = data[key];
			});

            // assign message
			const Message = this.model('Message');
			const message = campaign.message ?? new Message({ type: "campaign" });
			message.content = data.message?.content;
			await message.save();
			
			// set campaign message
			campaign.message = message.id;

			// assign targets
			// only targets are categories for now without include or excludes
			campaign.targets = data.targets.map((target) => ({
				target,
				onModel: "Category",
			}));

			// inject pre save hooks
			await inject("preSave", { data, connection, inject, campaign });

			// save the changed
			await campaign.save();

			// inject post save hooks
			await inject("postSave", { data, connection, inject, campaign });

			// return modified campaign
			return campaign;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Resolve all people of the campaign
	 *
	 * @return Person[]
	 */
	async resolvePeople() {
		let resolved = [];
		const Person = this.model("Person");

		for (const item of this.targets) {
			switch (toLower(item.onModel)) {
				case "person":
					resolved = [
						...resolved,
						await Person.findById(item.target),
					];
					continue;

				case "category":
					resolved = [
						...resolved,
						...(await Person.find({ categories: item.target })),
					];
					continue;

				case "tag":
					resolved = [
						...resolved,
						...(await Person.find({ tags: item.target })),
					];
					continue;

				default:
					continue;
			}
		}

		return resolved;
	}
}

module.exports = Campaign;
