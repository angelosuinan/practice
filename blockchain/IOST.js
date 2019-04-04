
/**
 * This module is reponsible for communicating with IOST bounties
 * 
 * @class IOST
 */
class IOST {
  /**
   * Returns the transaction hash of the claimReward Transaction 
   * > Use when a user wants to redeem iost rewards Before this fucntion execute, 
   * > you must call Bounty.username(url), to check if the claimAddress is entitled for rewards
   * 
   * @method claimAddress
   * @static
   * @async
   * @param {String} claimAddress
   * @returns {Promise<String>}
   */
  static async claimReward(claimAddress) {
    isTruthy(claimAddress, 'claimAddress', 'Stellar.claimReward')
  }

  /**
   * Returns a single bounty for a github issue
   * > Use for frontend to display a single IOST bounty
   * 
   * {
   *   "amount": "the amount of rewards",
   *   "url": " the github issue url(unique identifier)"
   * }
   * @method query
   * @static
   * @async
   * @param {String} url
   * @returns {Object}
   */
  static async query(url) {
    isTruthy(url, 'query', 'Stellar.query')
  }

  /**
   * Returns a list of bounties for a github issues
   * 
   * > Use if frontends needs to display list of IOST bounties
   * [
   *   {
   *     "amount": "the amount of rewards",
   *     "url": " the github issue url(unique identifier)"
   *   }
   * ]
   * @method list
   * @returns {Promise<Array>}
   */
  static async list() {
    
  }
}