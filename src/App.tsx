import { Box, Button, CloseButton, Field, Flex, Input, InputGroup, Separator, Text } from '@chakra-ui/react'
import { useRef, useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form'
import Header from './components/Header';

interface FormValues {
  firstSubsequense: string
  secondSubsequense: string
}

const ALLOWED_SYMBOLS = "ARNDCEQGHILKMFPSTWYV-";
const COLOR_MAP: Record<string, string> = {
  'C': '#FFEA00',
  'A': '#67E4A6',
  'I': '#67E4A6',
  'L': '#67E4A6',
  'M': '#67E4A6',
  'F': '#67E4A6',
  'W': '#67E4A6',
  'Y': '#67E4A6',
  'V': '#67E4A6',
  'P': '#67E4A6',
  'G': '#C4C4C4',
  'D': '#FC9CAC',
  'E': '#FC9CAC',
  'K': '#BB99FF',
  'R': '#BB99FF',
  'S': '#80BFFF',
  'T': '#80BFFF',
  'H': '#80BFFF',
  'Q': '#80BFFF',
  'N': '#80BFFF',
  '-': 'none'
};

function App() {
  const [coloredFirstSequence, setColoredFirstSequence] = useState<JSX.Element[] | null>(null);
  const [coloredSecondSequence, setColoredSecondSequence] = useState<JSX.Element[] | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const secondInputRef = useRef<HTMLInputElement | null>(null);
  const {
    control,
    watch,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({defaultValues: {
    firstSubsequense: '',
    secondSubsequense: ''
  }})

  const clearButton = (sequenseName: string) => {
    if (watch(sequenseName)) {
      return (
        <CloseButton
          size="xs"
          onClick={() => {
            setValue(sequenseName, '')
            if (sequenseName === 'firstSubsequense') {
              firstInputRef.current?.focus()
            } else {
              secondInputRef.current?.focus()
            }
          }}
          me="-2"
        />
      )
    }

    return undefined
  }

  const validateAminoAcidInput = (value: string) => {
    return value
      .toUpperCase()
      .split('')
      .every(char => ALLOWED_SYMBOLS.includes(char)) 
      || "Only amino acid symbols are allowed";
  };

  const onSubmit = handleSubmit((data) => {
    clearErrors('root.lengthError');

    if (data.firstSubsequense.length !== data.secondSubsequense.length) {
      setError('root.lengthError', {
        type: 'manual',
        message: 'All sequences must be of the same length'
      });

      return
    }

    if (data.firstSubsequense) {
      const coloredFirstSymbols = data.firstSubsequense.split('').map((symbol, index) => (
        <Box
          key={index}
          bg={COLOR_MAP[symbol]}
          padding={0}
          margin={0}
          fontSize={{ base: "sm", md: "md" }}
          lineHeight="1.2"
          minW="15px"
          textAlign="center"
        >
          {symbol}
        </Box>
      ))

      setColoredFirstSequence(coloredFirstSymbols);

      const coloredSecondSymbols = data.secondSubsequense.split('').map((symbol, index) => {
        if (symbol === data.firstSubsequense[index]) {
          return (
          <Box
            key={index}
            padding={0}
            margin={0}
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.2"
            minW="15px"
            textAlign="center"
          >
            {symbol}
          </Box>
          )
        } else {
          return (
          <Box
            key={index}
            bg={COLOR_MAP[symbol]}
            padding={0}
            margin={0}
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.2"
            minW="15px"
            textAlign="center"
          >
            {symbol}
          </Box>
          )
        }
      })

      setColoredSecondSequence(coloredSecondSymbols)
    }
  })
  
  return (
    <>
    <Header />
    <Separator />
    <Box p={{ base: 4, md: 8 }} maxW="1280px" mx="auto">
      <form onSubmit={onSubmit}>
        <Flex 
          direction={{ base: "column", md: "row" }} 
          gap={{ base: 4, md: 6, lg: 8 }}
          align="stretch"
        >
          <Field.Root 
            flex="1" 
            invalid={!!errors.firstSubsequense}
          >
            <Controller
              name="firstSubsequense"
              control={control}
              rules={{ validate: validateAminoAcidInput }}
              render={({ field }) => (
                <InputGroup endElement={clearButton('firstSubsequense')}>
                  <Input
                    {...field}
                    ref={firstInputRef}
                    w="100%"
                    placeholder="Enter the first sequence"
                    onChange={(e) => {
                      const filteredValue = e.target.value
                        .toUpperCase()
                        .split('')
                        .filter(char => ALLOWED_SYMBOLS.includes(char))
                        .join('');
                      field.onChange(filteredValue);
                    }}
                    required
                    size={{ base: "sm", md: "md" }}
                  />
                </InputGroup>
              )}
            />
            <Field.ErrorText fontSize={{ base: "xs", md: "sm" }}>
              {errors.firstSubsequense?.message}
            </Field.ErrorText>
          </Field.Root>
          
          <Field.Root 
            flex="1" 
            invalid={!!errors.secondSubsequense}
          >
            <Controller
                name="secondSubsequense"
                control={control}
                rules={{ validate: validateAminoAcidInput }}
                render={({ field }) => (
                  <InputGroup endElement={clearButton('secondSubsequense')}>
                    <Input
                      {...field}
                      ref={secondInputRef}
                      w="100%"
                      placeholder="Enter the second sequence"
                      onChange={(e) => {
                        const filteredValue = e.target.value
                          .toUpperCase()
                          .split('')
                          .filter(char => ALLOWED_SYMBOLS.includes(char))
                          .join('');
                        field.onChange(filteredValue);
                      }}
                      required
                      size={{ base: "sm", md: "md" }}
                    />
                  </InputGroup>
                )}
              />
            <Field.ErrorText fontSize={{ base: "xs", md: "sm" }}>
              {errors.secondSubsequense?.message}
            </Field.ErrorText>
          </Field.Root>
        </Flex>
        
        {errors.root?.lengthError && (
          <Flex color="red.500" mt={2} fontSize={{ base: "xs", md: "sm" }} justifyContent={'center'}>
            <Text>{errors.root.lengthError.message}</Text>
          </Flex>
        )}
        <Flex justifyContent={'center'}>
          <Button
            marginTop={{ base: 6, md: 8 }}
            marginBottom={{ base: 4, md: 6 }}
            w={{ base: "100%", md: "300px", lg: "450px" }}
            size={{ base: "sm", md: "md" }}
            type='submit'
          >
            Submit
          </Button>
        </Flex>
      </form>
      
      {coloredFirstSequence && (
        <Box mt={{ base: 2, md: 4 }} overflowX="auto">
          <Flex wrap="wrap" gap="1px" fontFamily={'monospace'}>
            {coloredFirstSequence}
          </Flex>
        </Box>
      )}
      
      {coloredSecondSequence && (
        <Box mt={{ base: 2, md: 4 }} overflowX="auto">
          <Flex wrap="wrap" gap="1px" fontFamily={'monospace'}>
            {coloredSecondSequence}
          </Flex>
        </Box>
      )}
    </Box>
    </>
  )
}

export default App