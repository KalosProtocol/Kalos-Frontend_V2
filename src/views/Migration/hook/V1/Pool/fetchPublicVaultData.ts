import BigNumber from 'bignumber.js'
import { convertSharesToXalo } from 'views/Pools/helpers'
import { multicallv2 } from 'utils/multicall'
import kalosVaultAbi from 'config/abi/xaloVaultV2.json'
import { BIG_ZERO } from 'utils/bigNumber'

export const fetchPublicVaultData = async (kalosVaultAddress: string) => {
  try {
    const calls = ['getPricePerFullShare', 'totalShares', 'totalLockedAmount'].map((method) => ({
      address: kalosVaultAddress,
      name: method,
    }))
    const [[sharePrice], [shares], totalLockedAmount] = await multicallv2(kalosVaultAbi, calls, {
      requireSuccess: false,
    })
    const totalSharesAsBigNumber = shares ? new BigNumber(shares.toString()) : BIG_ZERO
    const totalLockedAmountAsBigNumber = totalLockedAmount ? new BigNumber(totalLockedAmount[0].toString()) : BIG_ZERO
    const sharePriceAsBigNumber = sharePrice ? new BigNumber(sharePrice.toString()) : BIG_ZERO
    const totalXaloInVaultEstimate = convertSharesToXalo(totalSharesAsBigNumber, sharePriceAsBigNumber)

    return {
      totalShares: totalSharesAsBigNumber.toJSON(),
      totalLockedAmount: totalLockedAmountAsBigNumber.toJSON(),
      pricePerFullShare: sharePriceAsBigNumber.toJSON(),
      totalXaloInVault: totalXaloInVaultEstimate.xaloAsBigNumber.toJSON(),
    }
  } catch (error) {
    return {
      totalShares: null,
      totalLockedAmount: null,
      pricePerFullShare: null,
      totalXaloInVault: null,
    }
  }
}
