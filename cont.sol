pragma solidity ^0.4.11;

/**
 * Contract that will hold bounty ethers
 */
contract Bounty {
  // Address that is authorized to execute reward ether bounties
  address public custodian;
  // Address that is designated to received the bounties
  address public rewardAddress;
  //
  string public githubUrl;
  
  /**
   * Create the contract, and sets the custodian of the contract
   */
  function Bounty(address pool, string url) public {
    custodian = pool;
    githubUrl = url;
  }

  /**
   * Modifier that will execute internal code block only if the sender is the custodian address
   */
  modifier onlyCustodian {
    if (msg.sender != custodian) {
      revert();
    }
    _;
  }
  
  /**
   * Assigns this contract the rewardAddress
   * @param bountyAddress the address of the receiver of the bounty
   */
  function assignReward(address bountyAddress) public onlyCustodian {
   rewardAddress = bountyAddress;
  }

  /**
   * Reward the user the bounty ethers and destroy this contract
   */
  function reward() public onlyCustodian {
    // throws on failure
    selfdestruct(rewardAddress);
  }
  
  function() public payable {
    // accept unspendable balance
  }

}

contract BountyTarget {
  uint public data;


  function createBounty(string url) public returns (address) {
    return new Bounty(msg.sender, url);
  }

}