const addHours = require("date-fns/addHours");
const isAfter = require("date-fns/isAfter");
const isBefore = require("date-fns/isBefore");
const setHours = require("date-fns/setHours");
const addDays = require("date-fns/addDays");

/**
 * Get delivery sent time
 * 
 * @param int delay
 * @return bool
 */
function getDeliverySendTime(delay = 0) {
    const shouldSentAt = addHours(new Date(), delay);

    const isWithinWorkingHours = (date) => {
        const startOfWorkingHours = new Date(date);
        startOfWorkingHours.setHours(8, 0, 0, 0);
    
        const endOfWorkingHours = new Date(date);
        endOfWorkingHours.setHours(22, 0, 0, 0);
    
        return isAfter(date, startOfWorkingHours) && isBefore(date, endOfWorkingHours);
    };

    return isWithinWorkingHours(shouldSentAt) ? shouldSentAt : setHours(addDays(new Date(), 1), 8);
}

module.exports = getDeliverySendTime;