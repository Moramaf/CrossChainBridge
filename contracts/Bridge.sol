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
        require(checkSign(addr, val, _nonce, v, r, s), "validator does not correct!");
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








   
//     struct Transaction {
//         address from;
//         address to;
//         uint chainId;
//         uint amount;
//         bool proccessed;
//     }
//     mapping(address => mapping(uint => Transaction)) public transactions; //to => nonce => Transaction
//     //mapping(uint => string) siggnatures; //nonce => signature
//     mapping(address => uint) public nonces; //count nonce for _to address
//     mapping(address => uint) public proccededNonce; //last procceded nonce

    // function swap(uint _amount, address _to, uint _chainID) public { // transfer tokens from msg.sender, burn them and emit event to obsereve by back service
    //     //imitation of back service observed event: {
    //     // uint _nonce = nonces[_to];
    //     // nonces[_to] ++;
    //     // Transaction memory _transaction;
    //     // _transaction.from = msg.sender;
    //     // _transaction.to = _to;
    //     // _transaction.chainId = _chainID;
    //     // _transaction.amount = _amount;
    //     // transactions[_to][_nonce] = _transaction;
    //     //   }   imitation of back service observed event
    //     // signuture is made in back service an; // сформировать сингантуру и отправить пользователю, которая храниться в базе

    //     //token.transferFrom(msg.sender, address(this), _amount); // should be approved for this contact address
    //     token.burn(msg.sender, _amount); //burn tokens in this chain
    //     emit SwapInitialized(msg.sender, _to, _chainID, _amount);
    // }

    // function redeem() public {
    //     //check if msg.sender has no procedded transaction. Call back service.
    //     uint _nonce = nonces[msg.sender];
    //     Transaction memory trans = transactions[msg.sender][_nonce];        
    //     require(!trans.proccessed && trans.amount > 0, "No transaction to redeem");
    //     //  принимает сингнатуру,  если сигнатура правильная отдает токены - Функция : вызывает функцию ecrecover и восстанавливает по хэшированному сообщению и сигнатуре адрес валидатора, если адрес совпадает с адресом указанным на контракте моста то пользователю отправляются токен
    //     // checkSign(addr, val, v, r, s);
    //     // ERC20.mint(msg.sender, val);
    //   //require проверка сигнатуры на второе использование. Число нонс должны добовлять в хэш
    //   //user request signature and get it back
    //   //encode проверить публичный ключ


    // }

//     function updateChainById() external { // - Функция updateChainById(): добавить блокчейн или удалить по его chainID

//     }
//     function includeToken(address _token) external {
//         token = TokenERC20(_token);// - Функция includeToken(): добавить токен для передачи его в другую сеть 
//    // адрес символ и имя токена - проверять есть ли такой токен на указанном блокчейне
//     }
//     function excludeToken() external {} // - Функция excludeToken(): исключить токен для передачи


