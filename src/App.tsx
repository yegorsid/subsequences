import { Box, Button, CloseButton, Field, Flex, Input, InputGroup, Separator, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState} from 'react';
import { Controller, useForm } from 'react-hook-form'
import Header from './components/Header';
import { Toaster, toaster } from './components/ui/toaster';
import { debounce } from 'throttle-debounce';

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
  '-': 'transparent'
};

function App() {
  const [firstSequence, setFirstSequence] = useState('');
  const [secondSequence, setSecondSequence] = useState('');
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

  const clearButton = (sequenseName: keyof FormValues) => {
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
      return;
    }

    setFirstSequence(data.firstSubsequense);
    setSecondSequence(data.secondSubsequense);
  });
  
  useEffect(() => {
    const handleTextSelection = debounce(800, () => {
      const selectedText = window.getSelection()?.toString();

      if (!selectedText || selectedText === '') return
      navigator.clipboard.writeText(selectedText)
      .then(() => toaster.success({
        description: "Copied to clipboard",
        duration: 1000
      }))
    })
    
    document.addEventListener('selectionchange', handleTextSelection);

    return document.addEventListener('selectionchange', handleTextSelection);
  }, [])

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
      
      <Box position={'relative'}>
        {firstSequence && (
          <Flex mt={{ base: 2, md: 4 }} fontFamily={'monospace'} height={{ base: "14px", md: "16px" }} letterSpacing={2} wrap={'wrap'} rowGap={{ base: "28px", md: "32px" }}>
            {firstSequence.split('').map((symbol, index) => (
              <Box
                display={'inline-block'}
                key={index}
                padding={'0 2px'}
                margin={0}
                fontSize={{ base: "sm", md: "md" }}
                textAlign="center"
                as={'span'}
                bg={COLOR_MAP[symbol]}
                lineHeight={{ base: "14px", md: "16px" }}
                border={0}
                w={{ base: "14px", md: "16px" }}
              >
                {symbol}
              </Box>
            ))}
          </Flex>
        )}
        
        {secondSequence && (
          <Flex fontFamily={'monospace'} position={'absolute'} top={{ base: "14px", md: "16px" }} height={{ base: "14px", md: "16px" }} w={'100%'} letterSpacing={2} wrap={'wrap'} rowGap={{ base: "28px", md: "32px" }}>
            {secondSequence.split('').map((symbol, index) => {
              const shouldBeColored = symbol !== firstSequence[index];
              return (
                <Box
                display={'inline-block'}
                key={index}
                padding={'0 2px'}
                margin={0}
                fontSize={{ base: "sm", md: "md" }}
                textAlign="center"
                bg={shouldBeColored ? COLOR_MAP[symbol] : 'transparent'} 
                lineHeight={{ base: "14px", md: "16px" }}
                as={'span'}
                border={0}
                w={{ base: "14px", md: "16px" }}
              >
                {symbol}
              </Box>
              )
            })}
          </Flex>
        )}
      </Box>
      <Toaster />
    </Box>
    </>
  )
}

export default App