//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {LiquidityToken} from "./LiquidityToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

contract LiquidityPool is LiquidityToken, ReentrancyGuard, ERC165 {
    ////////////////////////////////////////
    ///////////// errors ///////////////////
    ////////////////////////////////////////
    error LiquidityPool__InvalidToken();
    error LiquidityPool__SwapTransferFailed();
    error LiquidityPool__InvalidTokenRatio();
    error LiquidityPool__ZeroLiquidityTokens();
    error LiquidityPool__NotEnoughReserve();

    IERC20 private immutable I_TOKEN0; //Both of the tokens represented here are erc20 tokens
    IERC20 private immutable I_TOKEN1;
    uint256 private immutable I_FEE;

    ////////////////////////////////////////
    ////////// state variables /////////////
    ////////////////////////////////////////

    uint256 private sReserve0; //reserve is the amount of token that is available in the pool for the respective token
    uint256 private sReserve1;
    mapping(address token => uint256 reserve) sTokenToReserve;
    address[] public sTokens;

    ///////////////////////////////////////
    ///////////// functions ///////////////
    ///////////////////////////////////////
    constructor(address token0, address token1, uint256 fee) LiquidityToken("LiquidityToken", "LPT") {
        I_TOKEN0 = IERC20(token0);
        I_TOKEN1 = IERC20(token1);
        I_FEE = fee;
        sTokens.push(token0);
        sTokens.push(token1);
    }

    ///////////////////////////////////////
    ///////////// modifiers ///////////////
    ///////////////////////////////////////
    modifier invalidToken(address tokenIn) {
        _invalidToken(tokenIn);
        _;
    }

    ///////////////////////////////////////
    ////////// external////// /////////////
    ///////////////////////////////////////
    function swap(address tokenIn, uint256 amountIn) public invalidToken(tokenIn) nonReentrant {
        uint256 reserveIn;
        uint256 reserveOut;
        // uint256 amountInWithFee = amountIn - I_FEE;
        // Objective: to find amount of token out
        address tokenOut = getTokenOut(tokenIn);
        reserveIn = sTokenToReserve[tokenIn];
        reserveOut = sTokenToReserve[tokenOut];
        uint256 amountOut = getAmountOut(tokenIn, tokenOut, amountIn);

        updateReserves(tokenIn, tokenOut, amountIn, amountOut);

        bool success = IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        if (!success) {
            revert LiquidityPool__SwapTransferFailed();
        }

        bool transfer = IERC20(tokenOut).transfer(msg.sender, amountOut);
        if (!transfer) {
            revert LiquidityPool__SwapTransferFailed();
        }
    }

    function addLiquidity(uint256 amount0, uint256 amount1) public nonReentrant {
        if (sTokenToReserve[address(I_TOKEN0)] > 0 || sTokenToReserve[address(I_TOKEN1)] > 0) {
            if (sTokenToReserve[address(I_TOKEN0)] / sTokenToReserve[address(I_TOKEN1)] != amount0 / amount1) {
                revert LiquidityPool__InvalidTokenRatio();
            }
        }

        I_TOKEN0.transferFrom(msg.sender, address(this), amount0);
        I_TOKEN1.transferFrom(msg.sender, address(this), amount1);

        //Now that the liquidity provider has added the liquiidity we need to mint the liquidity provider with liquidity tokens
        //LP tokens minted ∝ how much liquidity you add relative to the pool size
        //The liquidity tokens minted should be in propotion to the liquidity provided

        // x + dx/x = y + dy/y --This means you must add both the tokens in the same ratio
        // Now that both the token amount are added in the same ratio the LP tokens minted and the amont added should also be in the same ratio
        // mintedLP/TotalSupply = amountAdded/poolReserves
        // dx/x = dl/l
        // l.dx = x.dl
        // l.dx/x = dl

        uint256 liquidityTokenSupply = totalSupply();
        uint256 liquidityTokens;
        if (liquidityTokenSupply > 0) {
            liquidityTokens = ((amount0 + amount1) * liquidityTokenSupply)
                / (sTokenToReserve[address(I_TOKEN0)] + sTokenToReserve[address(I_TOKEN1)]);
        } else {
            liquidityTokens = _sqrt(amount0 * amount1);
        }

        if (liquidityTokens == 0) {
            revert LiquidityPool__ZeroLiquidityTokens();
        }
        updateLiquidity(sTokenToReserve[address(I_TOKEN0)] + amount0, sTokenToReserve[address(I_TOKEN1)] + amount1);
        _mint(msg.sender, liquidityTokens);
    }

function removeLiquidity(uint256 liquidityTokens) public nonReentrant {
    uint256 total = totalSupply();
    require(total > 0, "No liquidity");
    require(balanceOf(msg.sender) >= liquidityTokens, "Not enough LP tokens");

    uint256 reserve0 = sTokenToReserve[address(I_TOKEN0)];
    uint256 reserve1 = sTokenToReserve[address(I_TOKEN1)];

    uint256 amount0 = (liquidityTokens * reserve0) / total;
    uint256 amount1 = (liquidityTokens * reserve1) / total;

    _burn(msg.sender, liquidityTokens);

    sTokenToReserve[address(I_TOKEN0)] = reserve0 - amount0;
    sTokenToReserve[address(I_TOKEN1)] = reserve1 - amount1;

    require(I_TOKEN0.transfer(msg.sender, amount0), "Token0 transfer failed");
    require(I_TOKEN1.transfer(msg.sender, amount1), "Token1 transfer failed");
}


    function supportsInterface(bytes4 interfaceId) public pure override returns (bool) {
        return false;
    }

    ///////////////////////////////////////
    ////////// external view //////////////
    ///////////////////////////////////////
    function getTokens() public view returns (address, address) {
        return (sTokens[0], sTokens[1]);
    }

    function getFee() public view returns (uint256) {
        return I_FEE;
    }

    function getPoolLiquidity() public view returns (uint256) {
        return (sTokenToReserve[address(I_TOKEN0)] + sTokenToReserve[address(I_TOKEN1)]);
    }

    function getReserveOfToken(address token) public view returns (uint256) {
        return sTokenToReserve[token];
    }

    ///////////////////////////////////////
    ////////////// internal ///////////////
    ///////////////////////////////////////
    function updateLiquidity(uint256 reserve0, uint256 reserve1) internal {
        sTokenToReserve[address(I_TOKEN0)] = reserve0;
        sTokenToReserve[address(I_TOKEN1)] = reserve1;
        sReserve0 = reserve0;
        sReserve1 = reserve1;
    }

    function getTokenOut(address tokenIn) internal view returns (address) {
        if (tokenIn == address(I_TOKEN0)) {
            return address(I_TOKEN1);
        } else {
            return address(I_TOKEN0);
        }
    }

    function getAmountOut(address tokenIn, address tokenOut, uint256 amountIn) internal view returns (uint256) {
        uint256 reserveIn = sTokenToReserve[tokenIn];
        uint256 reserveOut = sTokenToReserve[tokenOut];

        // To get the amount out we will use the constant product AMM
        // x.y=k
        // (x+dx)(y-dy)=k  -- where x is the token In and y is the token Out
        // x.y - x.dy + y.dx - dx.dy = x.y -- k=xy
        // dy(x+dx) = y.dx
        // dy = y.dx/(x+dx) -- dy is the amount out dx is the amount in after fee cut

        uint256 amountInAfterFee = amountIn - I_FEE;

        uint256 amountOut = (reserveOut * amountInAfterFee) / (reserveIn + amountInAfterFee);

        if (amountOut > sTokenToReserve[tokenOut]) {
            revert LiquidityPool__NotEnoughReserve();
        }

        return amountOut;
    }

    function updateReserves(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut) internal {
        sTokenToReserve[tokenIn] += amountIn;
        sTokenToReserve[tokenOut] -= amountOut;
    }

    function _invalidToken(address tokenIn) internal view {
        if (tokenIn != address(I_TOKEN0) && tokenIn != address(I_TOKEN1)) {
            revert LiquidityPool__InvalidToken();
        }
    }

    function _sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
