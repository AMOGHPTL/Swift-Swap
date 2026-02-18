// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {LiquidityPool} from "../../src/LiquidityPool.sol";
import {LiquidityPoolFactory} from "../../src/LiquidityPoolFactory.sol";
import {DeployLPFactory} from "../../script/DeployLPFactory.sol";
import {HelperConfig} from "../../script/HelperConfig.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {LiquidityToken} from "../../src/LiquidityToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LPFactoryTest is Test {
    DeployLPFactory deployer;
    LiquidityPoolFactory poolFactory;
    HelperConfig config;
    address cardano;
    address matic;
    address solana;
    address usdc;
    address USER = makeAddr("user");
    uint256 STARTING_ERC20_BALANCE = 100 ether;
    uint256 public FEE = 1 ether;
    ERC20Mock public mock1;
    ERC20Mock public mock2;
    ERC20Mock public mock3;
    ERC20Mock public mock4;

    function setUp() public {
        deployer = new DeployLPFactory();
        (poolFactory, config, mock1, mock2, mock3, mock4) = deployer.run();
        (cardano, matic, solana, usdc) = config.activeNetworkConfig();
        ERC20Mock(cardano).mint(USER, STARTING_ERC20_BALANCE);
        ERC20Mock(matic).mint(USER, STARTING_ERC20_BALANCE);
        ERC20Mock(solana).mint(USER, STARTING_ERC20_BALANCE);
        ERC20Mock(usdc).mint(USER, STARTING_ERC20_BALANCE);
    }

    ////////////////////////////////////////
    ////////// creating pool tests//////////
    ////////////////////////////////////////

    function testCreatePool() public {
        vm.startBroadcast(USER);
        poolFactory.createPool(cardano, matic, FEE);
        vm.stopBroadcast();

        address[] memory allPools = poolFactory.getAllPools();
        address token0 = poolFactory.getPoolWithAddress(allPools[0]).token0;

        assertEq(allPools.length, 1);
        assertEq(token0, cardano);
    }

    ////////////////////////////////////////
    ///////// Liquidity pool tests /////////
    ////////////////////////////////////////

    function testAddingLiquidity() public {
        vm.startBroadcast(USER);
        poolFactory.createPool(cardano, matic, FEE);
        vm.stopBroadcast();

        LiquidityPoolFactory.PoolStruct memory poolInfo = poolFactory.getPoolInfo(cardano, matic);
        console.log("pool address:", poolInfo.poolAddress);

        vm.startPrank(USER);
        ERC20Mock(cardano).approve(poolInfo.poolAddress, type(uint256).max);
        ERC20Mock(matic).approve(poolInfo.poolAddress, type(uint256).max);
        LiquidityPool(poolInfo.poolAddress).addLiquidity(20 ether, 20 ether);
        vm.stopPrank();

        uint256 maticReserve = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(matic);
        uint256 cardanoReserve = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(cardano);
        uint256 userLiquidityTokenBalance = LiquidityPool(poolInfo.poolAddress).balanceOf(USER);

        console.log("liquidity tokens :", userLiquidityTokenBalance);

        assertEq(maticReserve, 20 ether);
        assertEq(cardanoReserve, 20 ether);
    }

    function testSwappingTokens() public {
        vm.startBroadcast(USER);
        poolFactory.createPool(cardano, matic, FEE);
        vm.stopBroadcast();

        LiquidityPoolFactory.PoolStruct memory poolInfo = poolFactory.getPoolInfo(cardano, matic);
        console.log("pool address:", poolInfo.poolAddress);

        vm.startPrank(USER);
        ERC20Mock(cardano).approve(poolInfo.poolAddress, type(uint256).max);
        ERC20Mock(matic).approve(poolInfo.poolAddress, type(uint256).max);
        LiquidityPool(poolInfo.poolAddress).addLiquidity(20 ether, 20 ether);
        vm.stopPrank();

        uint256 maticReservePreSwap = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(matic);
        uint256 cardanoReservePreSwap = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(cardano);
        uint256 userLiquidityTokenBalancePreSwap = LiquidityPool(poolInfo.poolAddress).balanceOf(USER);

        console.log("liquidity tokens :", userLiquidityTokenBalancePreSwap);
        console.log("cardano reserve pre swap :", cardanoReservePreSwap);
        console.log("matic reserve pre swap   :", maticReservePreSwap);

        vm.startPrank(USER);
        ERC20Mock(matic).approve(poolInfo.poolAddress, type(uint256).max);
        LiquidityPool(poolInfo.poolAddress).swap(matic, 20 ether);
        vm.stopPrank();

        uint256 maticReserve = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(matic);
        uint256 cardanoReserve = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(cardano);

        console.log("cardano reserve post swap:", cardanoReserve);
        console.log("matic reserve post swap  :", maticReserve);
    }

    function testRemovingLiquidity() public {
        vm.startBroadcast(USER);
        poolFactory.createPool(cardano, matic, FEE);
        vm.stopBroadcast();

        LiquidityPoolFactory.PoolStruct memory poolInfo = poolFactory.getPoolInfo(cardano, matic);
        console.log("pool address:", poolInfo.poolAddress);

        vm.startPrank(USER);
        ERC20Mock(cardano).approve(poolInfo.poolAddress, type(uint256).max);
        ERC20Mock(matic).approve(poolInfo.poolAddress, type(uint256).max);
        LiquidityPool(poolInfo.poolAddress).addLiquidity(20 ether, 20 ether);
        vm.stopPrank();

        uint256 maticReserveBefore = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(matic);
        uint256 cardanoReserveBefore = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(cardano);
        uint256 userLiquidityTokenBalanceBefore = LiquidityPool(poolInfo.poolAddress).balanceOf(USER);

        console.log("liquidity tokens :", userLiquidityTokenBalanceBefore);
        console.log("cardano reserve before :", cardanoReserveBefore);
        console.log("matic reserve before   :", maticReserveBefore);

        vm.startPrank(USER);
        LiquidityPool(poolInfo.poolAddress).approve(poolInfo.poolAddress, userLiquidityTokenBalanceBefore);
        LiquidityPool(poolInfo.poolAddress).removeLiquidity(userLiquidityTokenBalanceBefore);
        vm.stopPrank();

        uint256 maticReserve = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(matic);
        uint256 cardanoReserve = LiquidityPool(poolInfo.poolAddress).getReserveOfToken(cardano);
        uint256 userLiquidityTokenBalance = LiquidityPool(poolInfo.poolAddress).balanceOf(USER);

        console.log("liquidity tokens :", userLiquidityTokenBalance);
        console.log("cardano reserve  :", cardanoReserve);
        console.log("matic reserve    :", maticReserve);
    }
}
