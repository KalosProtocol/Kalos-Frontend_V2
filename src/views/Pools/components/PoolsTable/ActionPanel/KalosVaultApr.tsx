import { Box, Button, Flex, Skeleton, Text, CalculateIcon, useModal } from '@pancakeswap/uikit'
import Balance from 'components/Balance'
import { useTranslation } from 'contexts/Localization'
import { DeserializedPool, DeserializedLockedVaultUser, VaultKey, DeserializedVaultUser } from 'state/types'
import { useVaultApy } from 'hooks/useVaultApy'
import { VaultPosition } from 'utils/xaloPool'
import { MAX_LOCK_DURATION } from 'config/constants/pools'
import { VaultRoiCalculatorModal } from '../../Vault/VaultRoiCalculatorModal'

interface KalosVaultAprProps {
  pool: DeserializedPool
  userData: DeserializedVaultUser
  vaultPosition: VaultPosition
}

const KalosVaultApr: React.FC<KalosVaultAprProps> = ({ pool, userData, vaultPosition }) => {
  const { t } = useTranslation()

  const { flexibleApy, lockedApy } = useVaultApy({
    duration:
      vaultPosition > VaultPosition.Flexible
        ? +(userData as DeserializedLockedVaultUser).lockEndTime -
          +(userData as DeserializedLockedVaultUser).lockStartTime
        : MAX_LOCK_DURATION,
  })

  const [onPresentFlexibleApyModal] = useModal(<VaultRoiCalculatorModal pool={pool} />)
  const [onPresentLockedApyModal] = useModal(<VaultRoiCalculatorModal pool={pool} initialView={1} />)

  return (
    <>
      <Box marginX="8px" mb="8px">
        <Flex justifyContent="space-between">
          <Text fontSize="16px" color="textSubtle" textAlign="left">
            {t('Flexible APY')}
          </Text>
          {flexibleApy ? (
            <Flex alignItems="center" justifyContent="flex-start">
              <Balance fontSize="16px" value={parseFloat(flexibleApy)} decimals={2} unit="%" fontWeight="600" />
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onPresentFlexibleApyModal()
                }}
                variant="text"
                width="20px"
                height="20px"
                padding="0px"
                marginLeft="4px"
              >
                <CalculateIcon color="textSubtle" width="20px" />
              </Button>
            </Flex>
          ) : (
            <Skeleton width="80px" height="16px" />
          )}
        </Flex>
      </Box>
      {pool.vaultKey === VaultKey.KalosVault && (
        <Box marginX="8px" mb="8px">
          <Flex justifyContent="space-between">
            <Text fontSize="16px" color="textSubtle" textAlign="left">
              {t('Locked APY')}
            </Text>
            {lockedApy ? (
              <Flex alignItems="center" justifyContent="flex-start">
                <Text fontSize="16px" style={{ whiteSpace: 'nowrap' }} fontWeight="600">
                  {t('Up to')}
                </Text>
                <Balance
                  ml="7px"
                  fontSize="16px"
                  value={parseFloat(lockedApy)}
                  decimals={2}
                  unit="%"
                  fontWeight="600"
                />
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPresentLockedApyModal()
                  }}
                  variant="text"
                  width="20px"
                  height="20px"
                  padding="0px"
                  marginLeft="4px"
                >
                  <CalculateIcon color="textSubtle" width="20px" />
                </Button>
              </Flex>
            ) : (
              <Skeleton width="80px" height="16px" />
            )}
          </Flex>
        </Box>
      )}
    </>
  )
}

export default KalosVaultApr
