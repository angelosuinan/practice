const axios = require('axios')

const ACCOUNT_NAME = 'angelo'
const TRANSACTIONS = `http://54.249.186.224/api/account/${ACCOUNT_NAME}/txs`
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
    const {
      data: {
        data: { txnList }
      }
    } = await axios.get(TRANSACTIONS)

    txnList.forEach(tx => {})
  }
}

const merge = (arr, obj) => {
  if (arr.length === 0) {
    return [obj]
  }

  let merged = false
  const res = arr.map(elem => {
    if (elem.url === obj.url) {
      merged = true
      return {
        amount: parseFloat(elem.amount) + parseFloat(obj.amount),
        url: elem.url
      }
    } else {
      return elem
    }
  })

  if (!merged) {
    res.push(obj)
  }
  return res
}

module.exports = IOST
