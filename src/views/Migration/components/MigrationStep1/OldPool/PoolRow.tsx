import React, { useState } from 'react'
import styled from 'styled-components'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import { DeserializedPool, VaultKey } from 'state/types'
import { useVaultPoolByKeyV1 } from 'views/Migration/hook/V1/Pool/useFetchIfoPool'
import { BIG_ZERO } from 'utils/bigNumber'
import { getKalosVaultEarnings } from 'views/Pools/helpers'
import { useMatchBreakpointsContext } from '@pancakeswap/uikit'
import NameCell from './Cells/NameCell'
import StakedCell from './Cells/StakedCell'
import AutoEarningsCell from './Cells/AutoEarningsCell'
import EarningsCell from './Cells/EarningsCell'
import TotalStakedCell from './Cells/TotalStakedCell'
import Unstaked from './Cells/Unstaked'
import ExpandActionCell from './Cells/ExpandActionCell'
import ActionPanel from './ActionPanel/ActionPanel'

interface PoolRowProps {
  pool: DeserializedPool
  account: string
}

const StyledRow = styled.div`
  display: flex;
  background-color: transparent;
  cursor: pointer;
  ${({ theme }) => theme.mediaQueries.lg} {
    cursor: initial;
  }
`

const LeftContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.sm} {
    align-self: center;
    flex-direction: row;
  }
`

const RightContainer = styled.div`
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  padding: 24px 0;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    align-items: center;
  }
`

const PoolRow: React.FC<PoolRowProps> = ({ pool, account }) => {
  const { isMobile, isXl, isXxl } = useMatchBreakpointsContext()
  const isLargerScreen = isXl || isXxl
  const [expanded, setExpanded] = useState(false)
  const shouldRenderActionPanel = useDelayedUnmount(expanded, 300)
  const isXaloPool = pool.sousId === 0

  const { vaultPoolData } = useVaultPoolByKeyV1(pool.vaultKey)
  const { totalXaloInVault, pricePerFullShare } = vaultPoolData
  const { xaloAtLastUserAction, userShares } = vaultPoolData.userData

  const vaultPools = {
    [VaultKey.KalosVaultV1]: useVaultPoolByKeyV1(VaultKey.KalosVaultV1).vaultPoolData,
    [VaultKey.IfoPool]: useVaultPoolByKeyV1(VaultKey.IfoPool).vaultPoolData,
  }
  const xaloInVaults = Object.values(vaultPools).reduce((total, vault) => {
    return total.plus(vault.totalXaloInVault)
  }, BIG_ZERO)

  // Auto Earning
  let earningTokenBalance = 0
  if (pricePerFullShare) {
    const { autoXaloToDisplay } = getKalosVaultEarnings(
      account,
      xaloAtLastUserAction,
      userShares,
      pricePerFullShare,
      pool.earningTokenPrice,
    )
    earningTokenBalance = autoXaloToDisplay
  }
  const hasEarnings = account && xaloAtLastUserAction?.gt(0) && userShares?.gt(0)

  const toggleExpanded = () => {
    if (!isLargerScreen) {
      setExpanded((prev) => !prev)
    }
  }

  const EarningComponent = () => {
    if (isLargerScreen || !expanded) {
      return pool.vaultKey === VaultKey.IfoPool || pool.vaultKey === VaultKey.KalosVaultV1 ? (
        <AutoEarningsCell hasEarnings={hasEarnings} earningTokenBalance={earningTokenBalance} />
      ) : (
        <EarningsCell pool={pool} account={account} />
      )
    }
    return null
  }

  return (
    <>
      <StyledRow role="row" onClick={toggleExpanded}>
        <LeftContainer>
          <NameCell pool={pool} />
          {isLargerScreen || !expanded ? <StakedCell pool={pool} account={account} /> : null}
          {EarningComponent()}
          {isLargerScreen && isXaloPool && (
            <TotalStakedCell pool={pool} totalXaloInVault={totalXaloInVault} xaloInVaults={xaloInVaults} />
          )}
        </LeftContainer>
        <RightContainer>
          {isLargerScreen || !expanded ? <Unstaked pool={pool} /> : null}
          {!isLargerScreen && <ExpandActionCell expanded={expanded} showExpandedText={expanded || isMobile} />}
        </RightContainer>
      </StyledRow>
      {!isLargerScreen && shouldRenderActionPanel && <ActionPanel pool={pool} account={account} expanded={expanded} />}
    </>
  )
}

export default PoolRow
