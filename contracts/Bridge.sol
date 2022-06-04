//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// - Написать контракт кроссчейн моста для отправки токенов стандарта ERC-20 между сетями Ethereum и Binance Smart chain.
// - Написать полноценные тесты к контракту
// - Написать скрипт деплоя
// - Задеплоить в тестовую сеть
// - Написать таск на swap, redeem
// - Верифицировать контракт

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./TokenERC20.sol";
//Access- Control - burner and minter


contract Bridge {
    TokenERC20 public token;
    address public validator;

    uint public nonce;
    mapping(uint => bool) public processedNonces;
    uint public chainID;
    uint public otherChainID;

    event SwapInitialized(
        address indexed _from,
        address indexed _to,
        uint _amount,
        uint _chainId,
        uint nonce
        );

  constructor(address _tokenAddress, uint _chainID, uint _otherChainID) { // chainID ETH: 1, BSC: 57
    validator = msg.sender;
    token = TokenERC20(_tokenAddress);
    chainID = _chainID;
    otherChainID = _otherChainID;

  }

    function swap(uint _amount, address _to) public { 
        // transfer tokens from msg.sender, burn them and emit event to obsereve by back service
        token.burn(msg.sender, _amount); //burn tokens in this chain
        emit SwapInitialized(msg.sender, _to, _amount, otherChainID, nonce);
        nonce ++;

    }

    function redeem(address addr, uint256 val, uint _chainId, uint _nonce, uint8 v, bytes32 r, bytes32 s) public {
        require(processedNonces[_nonce] == false, "transfer already processed"); //check of double spending of the hash nonce
        require(_chainId == chainID, "chain is not correct"); //check if chain is coorect
        processedNonces[_nonce] = true;
        require(checkSign(addr, val, _nonce, v, r, s), "sign does not correct!");
        token.mint(msg.sender, val);
    }


    function checkSign(address addr, uint256 val, uint _nonce, uint8 v, bytes32 r, bytes32 s ) private view returns (bool){
        bytes32 message = keccak256(
            abi.encodePacked(addr, val, _nonce)
            );
            address addrToCheck = ecrecover(hashMessage(message), v, r, s);
            if(addrToCheck == validator){
                return true;
                } else {
                    return false;
                    }
    }

   function hashMessage(bytes32 message) private pure returns (bytes32) {
       	bytes memory prefix = "\x19Ethereum Signed Message:\n32";
       	return keccak256(abi.encodePacked(prefix, message));
   }
}