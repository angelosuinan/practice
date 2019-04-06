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
 * This module interfaces with XLM bounties
 *
 * @class Stellar
 */
class Stellar {
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
  static async claimReward(url, claimAddress) {
    isTruthy(claimAddress, 'claimAddress', 'Stellar.claimReward')

    const txs = await server
      .transactions()
      .limit(200)
      .forAccount(sourcePublicKey)
      .call()

    const amount = await txs.records.reduce(async (acc, tx) => {
      const { memo } = tx

      if (!(memo === url)) {
        return acc
      }
      if (memo.includes('DONE')) return acc
      const operations = await tx.operations()
      const [{ amount }] = operations.records

      return parseFloat(amount) + (await acc)
    }, 0)
    if (!amount) {
      throw new Error('no bounties found')
    }
    const account = await server.loadAccount(sourcePublicKey)
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: claimAddress,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString()
        })
      )
      .addMemo(StellarSdk.Memo.text(`${url}${SENT_KEYWORD}`))
      .setTimeout(30)
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
   * @returns {Promise<Object>}
   */
  static async query(url) {
    isTruthy(url, 'github issue url', 'Stellar.query')

    const txs = await server
      .transactions()
      .limit(200)
      .forAccount(sourcePublicKey)
      .call()

    const amount = await txs.records.reduce(async (acc, transaction) => {
      const { memo } = transaction

      if (!(memo === url)) {
        return acc
      }
      if (memo.includes('DONE')) return acc

      const accumulator = (await acc) || 0
      const operations = await transaction.operations()
      const [{ amount }] = operations.records

      return parseFloat(amount) + accumulator
    }, 0)

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

    const wat = await txs.records.reduce(async (acc, transaction) => {
      const { memo } = transaction

      if (memo.includes('DONE')) return acc

      const operations = await transaction.operations()
      const [{ amount }] = operations.records

      const obj = {
        amount,
        url: memo
      }
      const s = await acc

      return merge(s, obj)
    }, [])

    return wat
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
module.exports = Stellar
