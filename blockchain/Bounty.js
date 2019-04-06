const { isTruthy } = require('./validators')
const ethers = require('ethers')
const axios = require('axios')
const abi = require('ethereumjs-abi')
const util = require('ethereumjs-util')
const InputDataDecoder = require('ethereum-input-data-decoder')
const BountyAbi = require('./BountyAbi.json')
const BountyTargetAbi = require('./BountyTargetAbi.json')

const CREATE_BOUNTY = 'createBounty(string,string)'
const ASSIGN_REWARD = 'assignReward(string)'
const REWARD = 'reward(address)'
const CUSTODIAN_KEY =
  '7D8D774540919154180925AAD388D1F12351C8D84A4C52A66D9B2C24111B8E0D'
const CUSTODIAN_ADDRESS = '0x576e62D095692B1b635B458869eaAAf3ab6FC033'
const BOUNTY_TARGET_ADDRESS = '0x7E5EF3b8fe9216f12FE884670047bc32FA55559f'
const GAS_LIMIT = 5000000
const GAS_PRICE = 50000000000
const CHAIN_ID = 3
const BountyDecoder = new InputDataDecoder(BountyAbi)
const BountyTargetDecoder = new InputDataDecoder(BountyTargetAbi)
/**
 * This module interfaces with the Ethereum Bounty contract
 *
 * @class Bounty
 */
class Bounty {
  static get custodianWallet() {
    return new ethers.Wallet(CUSTODIAN_KEY, this.provider)
  }

  static get provider() {
    return new ethers.providers.InfuraProvider(
      'ropsten',
      '0e59bd9ea109496ea14c5d3ea3982133'
    )
  }

  static async getNextContractAddress(address) {
    const nonce = await this.provider.getTransactionCount(address, 'pending')
    return ethers.utils.getAddress(
      util.bufferToHex(util.generateAddress(address, nonce))
    )
  }

  static async normalTransactions(address) {
    const url = `https://blockscout.com/eth/ropsten/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken`

    const { data } = await axios.get(url)

    return data.result
  }

  static async internalTransaction(hash) {
    const url = `https://blockscout.com/eth/ropsten/api?module=account&action=txlistinternal&txhash=${hash}&apikey=YourApiKeyToken`

    const { data } = await axios.get(url)

    return data.result
  }
  /**
   * Return the contract address.
   *
   * @method create
   * @async
   * @static
   * @param {String} url
   * @param {String} metadata
   * @returns {Promise<String>}
   */
  static async create(url, metadata) {
    isTruthy(url, 'url', 'Bounty.create')
    isTruthy(metadata, 'metadata', 'Bounty.create')

    const encoded = abi
      .simpleEncode(CREATE_BOUNTY, url, metadata)
      .toString('hex')

    const nonce = await this.provider.getTransactionCount(
      CUSTODIAN_ADDRESS,
      'pending'
    )
    const gasPrice = ethers.utils.bigNumberify(GAS_PRICE)

    const transaction = {
      nonce: ethers.utils.hexlify(nonce),
      gasLimit: ethers.utils.hexlify(GAS_LIMIT),
      gasPrice: ethers.utils.hexlify(gasPrice),
      to: BOUNTY_TARGET_ADDRESS,
      value: '0x',
      data: `0x${encoded}`,
      chainId: CHAIN_ID
    }

    const signedTransaction = await this.custodianWallet.sign(transaction)

    await this.provider.sendTransaction(signedTransaction)

    const contractAddress = await this.getNextContractAddress(
      BOUNTY_TARGET_ADDRESS
    )

    return contractAddress
  }

  /**
   * Returns the hash. This is to assign a Bounty contract it's entitled username/receiver of the rewards
   *
   * @method addUsername
   * @async
   * @static
   * @param {String} url
   * @returns {Promise<String>}
   */
  static async addUsername(url, username) {
    isTruthy(url, 'url', 'Bounty.addUsername')
    isTruthy(username, 'username', 'Bounty.addUsername')

    const contractAddress = await this.address(url)

    const encoded = abi.simpleEncode(ASSIGN_REWARD, username).toString('hex')
    const nonce = await this.provider.getTransactionCount(
      CUSTODIAN_ADDRESS,
      'pending'
    )
    const gasPrice = await this.provider.getGasPrice()

    const transaction = {
      nonce: ethers.utils.hexlify(nonce),
      gasLimit: ethers.utils.hexlify(GAS_LIMIT),
      gasPrice: ethers.utils.hexlify(gasPrice),
      to: contractAddress,
      value: '0x',
      data: `0x${encoded}`,
      chainId: CHAIN_ID
    }
    const signedTransaction = await this.custodianWallet.sign(transaction)

    const { hash } = await this.provider.sendTransaction(signedTransaction)
    return hash
  }

  /**
   * Query a Bounty contract and returns its username
   *
   * @method username
   * @async
   * @static
   * @param {Promise<String>} url
   */
  static async username(url) {
    isTruthy(url, 'url', 'Bounty.username')

    const contractAddress = await this.address(url)
    const contract = new ethers.Contract(
      contractAddress,
      BountyAbi,
      this.provider
    )
    const username = await contract.username()

    return username
  }

  /**
   * Query a Bounty contract and returns its metadata
   *
   * @method metadata
   * @async
   * @static
   * @param {Promise<String>} url
   */
  static async metadata(url) {
    isTruthy(url, 'url', 'Bounty.metada')

    const contractAddress = await this.address(url)
    const contract = new ethers.Contract(
      contractAddress,
      BountyAbi,
      this.provider
    )
    const metadata = await contract.metadata()

    return metadata
  }

  /**
   * Query a Bounty contract and returns its address
   *
   * @method address
   * @async
   * @static
   * @param {String} url
   * @returns {Promise<String>}
   */
  static async address(url) {
    isTruthy(url, 'url', 'Bounty.address')

    const txs = await this.normalTransactions(BOUNTY_TARGET_ADDRESS)

    const tx = txs.find(transaction => {
      let decoded
      try {
        decoded = BountyTargetDecoder.decodeData(transaction.input)
      } catch (_) {}
      const { inputs } = decoded
      if (inputs.includes(url)) {
        return true
      }
    })

    if (!tx) {
      throw new Error(`Bounty with a ${url} url does not exist`)
    }

    const [_, { contractAddress }] = await this.internalTransaction(tx.hash)

    return contractAddress
  }

  /**
   *
   * @method claimReward
   * @async
   * @static
   * @param {String} url
   * @param {String} username
   * @param {String} claimAddress
   * @returns {Promise<String>}
   */
  static async claimReward(url, username, claimAddress) {
    isTruthy(url, 'url', 'Bounty.claimReward')
    isTruthy(username, 'username', 'Bounty.claimReward')
    isTruthy(claimAddress, 'claimAddress', 'Bounty.claimReward')

    const { username: entitled, balance, amount, address } = await this.query(
      url
    )
    if (username !== entitled) {
      throw new Error(
        `username ${username} is not entitled, it is user "${entitled}"`
      )
    }

    const encoded = abi.simpleEncode(REWARD, claimAddress).toString('hex')
    const nonce = await this.provider.getTransactionCount(
      CUSTODIAN_ADDRESS,
      'pending'
    )
    const gasPrice = await ethers.utils.bigNumberify(GAS_PRICE)

    const transaction = {
      nonce: ethers.utils.hexlify(nonce),
      gasLimit: ethers.utils.hexlify(GAS_LIMIT),
      gasPrice: ethers.utils.hexlify(gasPrice),
      to: address,
      value: '0x',
      data: `0x${encoded}`,
      chainId: CHAIN_ID
    }

    const signedTransaction = await this.custodianWallet.sign(transaction)
    const { hash } = await this.provider.sendTransaction(signedTransaction)

    return hash
  }

  /**
   *
   * {
   *   "username": "username of the entitled receiver of the rewards",
   *   "amount": "the balance of the BountyContract AKA the amount of rewards",
   *   "address": "address of the BountyCOntract AKA the where funders deposit rewards",
   *   "url": " the github issue url(unique identifier of the Bounty contract)"
   * }
   * @method query
   * @async
   * @static
   * @param {String} url
   * @returns {Promise<Object>}
   */
  static async query(url) {
    isTruthy(url, 'url', 'Bounty.query')

    const txs = await this.normalTransactions(BOUNTY_TARGET_ADDRESS)

    const tx = txs.find(transaction => {
      let decoded
      try {
        decoded = BountyTargetDecoder.decodeData(transaction.input)
      } catch (_) {}
      const { inputs } = decoded

      if (inputs.includes(url)) {
        return true
      }
    })

    const [_, { contractAddress }] = await this.internalTransaction(tx.hash)

    const contract = new ethers.Contract(
      contractAddress,
      BountyAbi,
      this.provider
    )
    const decoded = BountyTargetDecoder.decodeData(tx.input)
    const { inputs } = decoded
    const username = await contract.username()
    const balanceBigNumber = await this.provider.getBalance(contractAddress)
    const balance = ethers.utils.formatEther(balanceBigNumber.toString())

    return {
      address: contractAddress,
      username,
      url,
      metadata: inputs[1],
      balance
    }
  }

  /**
   * [
   *   {
   *     "username": "username of the entitled receiver of the rewards",
   *     "amount": "the balance of the BountyContract AKA the amount of rewards",
   *     "address": "address of the BountyCOntract AKA the where funders deposit rewards",
   *     "url": " the github issue url(unique identifier of the Bounty contract)"
   *   }
   * ]
   * @method list
   * @async
   * @static
   * @returns {Promise<Object>}
   */
  static async list() {
    const txs = await this.normalTransactions(BOUNTY_TARGET_ADDRESS)

    const tx = txs.forEach(async transaction => {
      const { input, hash } = transaction
      let decoded
      try {
        decoded = BountyTargetDecoder.decodeData(input)
      } catch (_) {}
      const { inputs } = decoded

      if (inputs.length === 0) {
        return
      }

      const [_, { contractAddress }] = await this.internalTransaction(hash)

      const contract = new ethers.Contract(
        contractAddress,
        BountyAbi,
        this.provider
      )

      const balanceBigNumber = await this.provider.getBalance(contractAddress)
      const balance = ethers.utils.formatEther(balanceBigNumber.toString())

      const obj = {
        url: inputs[0],
        metadata: inputs[1],
        amount: balance
      }

      console.log(obj)
    })
  }
}

module.exports = Bounty
