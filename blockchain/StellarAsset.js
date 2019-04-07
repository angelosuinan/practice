const { isTruthy, isValidUrl } = require('./validators')
const StellarSdk = require('stellar-sdk')
StellarSdk.Network.useTestNetwork()
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org')

const sourceKeypair = StellarSdk.Keypair.fromSecret(
  'SCWZJFZJZIEVWHPYB4CCOT5RVJ62N6ZV4S2Z3LNWTVAG54DOJ3WPC75X'
)
const sourcePublicKey = sourceKeypair.publicKey()
const SENT_KEYWORD = 'SENT'

/**
 * This module interfaces with Stellar Asset bounties
 *
 * @class StellarAsset
 */
class StellarAsset {
  /**
   * Returns the instutional bounty address
   *
   * @method address
   * @static
   * @returns {String}
   */
  static address() {
    return 'GAZ4U553CFGJX7XTHT5OCRAWEEVI65KSVJXOIPMBWOWJE4B3MLINQQNA'
  }

  /**
   * Returns the transaction hash of the claimReward transaction
   * Use when a user wants to redeem stellar rewards Before this fucntion execute,
   * you must call Bounty.username(url), to check if the claimAddress is entitled for rewards
   *
   * @method claimReward
   * @static
   * @async
   * @param {String} url
   * @param {String} claimAddress
   * @returns {Promise<String>}
   */
  static async claimReward(url, claimAddress, assetIssuer, assetCode) {
    isTruthy(url, 'url', 'Stellar.url')
    isTruthy(claimAddress, 'claimAddress', 'Stellar.claimReward')
    isTruthy(assetIssuer, 'assetIssuer', 'Stellar.assetIssuer')
    isTruthy(assetCode, 'assetCode', 'Stellar.assetCode')

    const txs = await server
      .transactions()
      .limit(50)
      .forAccount(sourcePublicKey)
      .call()

    let wat = false
    const amount = await txs.records.reduce(async (acc, tx) => {
      const { memo } = tx
      const accumulator = (await acc) || 0

      if (!memo) return accumulator

      if (memo && !memo.includes(url)) {
        return accumulator
      }

      const operations = await tx.operations()
      const [{ amount, asset_code, asset_issuer }] = operations.records

      if (asset_code === assetCode && asset_issuer === assetIssuer) {
        if (!(memo === url) && memo.includes(SENT_KEYWORD)) {
          wat = true
        }
        return parseFloat(amount) + accumulator
      }
    }, 0)

    if (wat === true) {
      throw new Error('Bounty already redeemed')
    }
    if (!amount) {
      throw new Error('no bounties found')
    }

    const assetObject = new StellarSdk.Asset(assetCode, assetIssuer)

    const account = await server.loadAccount(sourcePublicKey)
    var transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: claimAddress,
          asset: assetObject,
          amount: amount.toString()
        })
      )
      .addMemo(StellarSdk.Memo.text(`${url}${SENT_KEYWORD}`))
      // setTimeout is required for a transaction
      .setTimeout(100)
      .build()
    transaction.sign(sourceKeypair)
    try {
      const transactionResult = await server.submitTransaction(transaction)
      return transactionResult.hash
    } catch (e) {
      console.log('An error has occured:' + e)
    }
  }

  /**
   * Returns a single bounty for github issue
   * > Use for frontend to display a single XLM bounty
   *
   * {
   *   "amount": "the amount of rewards",
   *   "url": " the github issue url(unique identifier)"
   * }
   * @method query
   * @static
   * @async
   * @param {String} url
   * @param {String} assetIssuer
   * @param {String} assetCode
   * @returns {Promise<Object>}
   */
  static async query(url, assetIssuer, assetCode) {
    isTruthy(url, 'github issue url', 'Stellar.query')
    isTruthy(assetIssuer, 'asset issuer', 'Stellar.asset issuer')
    isTruthy(assetCode, 'asset code', 'Stellar.query')

    const txs = await server
      .transactions()
      .limit(50)
      .forAccount(sourcePublicKey)
      .call()

    let wat = false
    let amount = await txs.records.reduce(async (acc, tx) => {
      const { memo } = tx
      const accumulator = (await acc) || 0

      if (!memo) return accumulator

      if (memo && !memo.includes(url)) {
        return accumulator
      }

      const operations = await tx.operations()
      const [{ amount, asset_code, asset_issuer }] = operations.records

      if (asset_code === assetCode && asset_issuer === assetIssuer) {
        if (!(memo === url) && memo.includes(SENT_KEYWORD)) {
          wat = true
        }
        return parseFloat(amount) + accumulator
      }
    }, 0)

    if (wat === true) {
      amount = 0
    }
    return {
      url,
      amount
    }
  }

  /**
   * Returns the list of XLM bounties for github issues
   *
   * > Use if frontends needs to display list of XLM bounties
   * [
   *   {
   *     "amount": "the amount of rewards",
   *     "url": " the github issue url(unique identifier)"
   *   }
   * ]
   * @method list
   * @static
   * @async
   * @returns {Promise<Array>}
   */
  static async list() {
    const txs = await server
      .transactions()
      .limit(200)
      .forAccount(sourcePublicKey)
      .call()

    const result = await txs.records.reduce(async (acc, tx) => {
      const { memo } = tx

      if (tx.to === StellarAsset.address()) {
        return acc
      }
      if (memo && memo.includes(SENT_KEYWORD)) return acc

      const accumulator = (await acc) || []
      const operations = await tx.operations()

      const [
        { amount, asset_code, asset_issuer, asset_type, to }
      ] = operations.records

      if (asset_type === 'credit_alphanum4' && to === StellarAsset.address()) {
        const obj = {
          amount,
          url: memo
        }

        return merge(accumulator, obj)
      }
    }, [])

    return result
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

module.exports = StellarAsset
