import { VscColorMode } from "react-icons/vsc";
import { Flex, Text, IconButton } from "@chakra-ui/react";
import { useColorMode } from "../components/ui/color-mode"

function Header() {
  const { toggleColorMode } = useColorMode()

  return (
    <Flex justifyContent={'space-between'} padding={'12px 24px'} alignItems={'center'}>
      <Text fontSize={'2xl'}>Subsequences</Text>
      <IconButton variant="outline" onClick={toggleColorMode} aria-label="Toggle Color Mode">
        <VscColorMode />
      </IconButton>
    </Flex>
  )
}

export default Header