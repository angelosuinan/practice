const axios = require('axios')

const BIFROST_URL = 'http://localhost:1337/api/v1/webhook'
const CALLBACK_URL = 'http://localhost:3000/bifrost/'
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
  static async ethereumWebhook(address, metadata) {
    try {
      await axios.post(
        BIFROST_URL,
        {
          address,
          url: CALLBACK_URL,
          currency: 'ETH',
          metadata
        },
        {
          headers: {
            Authorization: 'Bearer wut'
          }
        }
      )
      return true
    } catch (e) {
      console.log(e.response.data)
      console.log('something went wrong' + e)
    }
  }

  /**
   * Use when we want to notify the issue of new donations
   *
   * {
   *   "from": "the donor address",
   *   "to": "the receiver (Bounty Contract)",
   *   "amount": "the amount the donor entered",
   *   "metadata": "metadata stored by the user"
   * }
   * @method ethereumCallback
   * @static
   * @param {Object} callbackData - callback data from bifrost
   * @returns {Object}
   */
  static ethereumCallback(callbackData) {
    const { from, amount, to, metadata } = callbackData

    return {
      from,
      amount,
      to,
      metadata
    }
  }

  /**
   * {
   *   "from": "the donor address",
   *   "amount": "the amount donated",
   *   "metadata": "metadata stored by the user"
   * }
   * @method stellarCallback
   * @static
   * @param {Object} callbackData - callback data from bifrost
   * @returns {Object}
   */
  static stellarCallback(callbackData) {
    const { from, amount, memo } = callbackData

    if (type) {
      const { asset_code, asset_issuer } = callbackData
      return {
        amount,
        from,
        assetCode: asset_code,
        assetIssuer: asset_issuer,
        url: memo
      }
    }

    return {
      amount,
      from,
      url: memo
    }
  }
}

module.exports = Bifrost
