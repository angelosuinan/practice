

## Bounty
This library is responsible for communicating with the

`Bounty.create(url) => address` *`async`

Params:
- `url` - `string` - the github url of the issue

Returns:
- `address` - bounty address, this is the address that funders deposit ethers

`Bounty.assignReward(url, username)`

> This will assign the Bounty contract with a receiver github username 

Params:
- `url` - `string` - the github issue url
- `username` - `string` - the github username in which it will reward

`Bounty.checkReward(url) => username` *`async`

> returns the username of the bounty receiver

Params:
- `address` - `string` - the bounty address

Returns:
- `string` - the username of the bounty

`Bounty.claimReward(url, username, claimAddress) => tx_url` *`async`

> This will award the claimAddress with the bounty ethers

Params:
- `url` - `string` - the github issue url
- `username` - `string` - the github username in which it will reward
- `claimAddress` - `string` - the claim address of github developer who resolve the issue

Returns:
- `hash` - the tx url(not important)

`Bounty.reward(url) => object`

Params:
- `address` - the github issue url

> Returns a single bounty given a url
```json
{
    "url": "github.com/mc/issue#",
    "address": "bounty-address",
    "amount": "amount of bounty",
}
```
`Bounty.listRewards() => array`

> Returns the list of all created bounties(this is a looong request) might be limit it to 10

Return:
- `Array` - array of the object below

```json
{
    "url": "github.com/mc/issue#",
    "address": "bounty-address",
    "amoount": "amount of bounty",
}
```

## Stellar

`Stellar.bountyAddress => address`

Returns
- `address` - `string` bounty address, this is the address that funders deposit Stellar lumens 

`Stellar.claimRewards(claimAddress) => tx_url`

Params
- `address` - `string` the transaction hash

Returns
- `string` the transaction url

`Stellar.bounty(url) => amount`

Params
- `hash` - `string` the transaction hash

Returns
- `amount` - `string` the bounty amount in stellar


`Stellar.bounties() => array` 

> list all bounties in stellar

> Returns a single bounty given an address
```json
{
    "url": "github.com/mc/issue#",
    "address": "bounty-address",
    "amount": "amount of bounty",
}
```



### IOST

`IOST.bountyAddress => address`

Returns
- `address` - `string` bounty address, this is the address that funders deposit IOST 

### Bifrost

`Bifrost.ethereum(address, metadata)`

`Bifrost.controller`