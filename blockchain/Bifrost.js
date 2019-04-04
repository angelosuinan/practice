
/**
 * 
 */
class Bifrost {
  /**
   * Use we want to subscribe to Ether deposit event for specific address(BountyContract)
   * the metadata can be stored with github issue url or any relevant details.
   * 
   * @method ethereumWebhook
   * @static
   * @async
   * @param {String} address 
   * @param {Object} metadata
   * @returns {Promise<Boolean>}
   */
  static ethereumWebhook(address, metadata) {

  }
  
  /**
   * Use when we want to notify the issue of new donations
   * 
   * {
   *   "from": "the donor address",
   *   "to": "the receiver (Bounty Contract)",
   *   "amount": "the amount the donor entered",
   *   "metadata": "metadata set by the user"
   * }
   * @method ethereumCallback
   * @static
   * @param {Object} callbackData - callback data from bifrost
   * @returns {Object}
   */
  static ethereumCallback(callbackData) {

  }

  /**
   * {
   *   "from": "the donor address",
   *   "amount": "the amount donated",
   *   "url": "the github issue url"
   * }
   * @method stellarCallback
   * @static
   * @param {Object} callbackData - callback data from bifrost
   * @returns {Object}
   */
  static stellarCallback(callbackData) {

  }
}

module.exports = Bounty