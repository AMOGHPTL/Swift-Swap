// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {LiquidityPool} from "./LiquidityPool.sol";

contract LiquidityPoolFactory {
    ////////////////////////errors///////////////////////////

    error LiquidityPoolFactory__PoolExists();

    ///////////////////////State variables///////////////////

    address[] public sPoolsList;
    mapping(address => PoolStruct) public sPoolToPoolInfo;
    mapping(address => mapping(address => PoolStruct)) public sGetPool;
    mapping(address => address[]) public sTokenPairs;
    address[] public sTokenPairKeys;

    // tokens in pools
    struct PoolStruct {
        address poolAddress;
        address token0;
        address token1;
        uint256 fee;
    }

    ////////////////////Functions///////////////////

    //////////// Modifier /////////////////////////

    modifier poolExists(address token0, address token1, uint256 fee) {
        for (uint256 i; i < sPoolsList.length; i++) {
            if (sPoolToPoolInfo[sPoolsList[i]].token0 == token0) {
                if (sPoolToPoolInfo[sPoolsList[i]].token1 == token1) {
                    if (sPoolToPoolInfo[sPoolsList[i]].fee == fee) {
                        revert LiquidityPoolFactory__PoolExists();
                    }
                }
            }
        }
        _;
    }

    /////////////////External/////////////////////////////////////

    function createPool(address token0, address token1, uint256 fee) public poolExists(token0, token1, fee) {
        LiquidityPool liquidityPool = new LiquidityPool(token0, token1, fee);
        address poolAddress = address(liquidityPool);
        sPoolsList.push(poolAddress);
        sPoolToPoolInfo[poolAddress] = PoolStruct(poolAddress, token0, token1, fee);
        sGetPool[token0][token1] = PoolStruct(poolAddress, token0, token1, fee);
        sTokenPairs[token0].push(token1);
        sTokenPairs[token1].push(token0);
        sTokenPairKeys.push(token0);
        sTokenPairKeys.push(token1);
    }

    ///////////////External view/////////////////////////////////

    function getPool(address token0, address token1, uint256 fee) public view returns (address) {
        if (sGetPool[token0][token1].fee == fee) {
            return sGetPool[token0][token1].poolAddress;
        } else if (sGetPool[token1][token0].fee == fee) {
            return sGetPool[token1][token0].poolAddress;
        } else {
            return address(0);
        }
    }

    function getAllPools() public view returns (address[] memory) {
        return sPoolsList;
    }

    function getPoolWithAddress(address poolAddress) public view returns (PoolStruct memory) {
        return sPoolToPoolInfo[poolAddress];
    }

    function getPoolInfo(address token0, address token1) public view returns (PoolStruct memory) {
        if (sGetPool[token0][token1].poolAddress != address(0)) {
            return sGetPool[token0][token1];
        } else {
            return sGetPool[token1][token0];
        }
    }

    function getTokenPair(address token) public view returns (address[] memory) {
        return sTokenPairs[token];
    }

    function getTokenPairKeys() public view returns (address[] memory) {
        return sTokenPairKeys;
    }
}
