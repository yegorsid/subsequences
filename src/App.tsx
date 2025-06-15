import { Box, Button, CloseButton, Field, Flex, Input, InputGroup, Separator, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useRef, useState} from 'react';
import { Controller, useForm } from 'react-hook-form'
import Header from './components/Header';
import { Toaster, toaster } from './components/ui/toaster';
import { debounce } from 'throttle-debounce';

interface FormValues {
  firstSubsequense: string
  secondSubsequense: string
}

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

const ALLOWED_SYMBOLS = Object.keys(COLOR_MAP);

function App() {
  const [firstSequence, setFirstSequence] = useState('');
  const [secondSequence, setSecondSequence] = useState('');
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const secondInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
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

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString() === '') return;
    
    if (
      containerRef.current &&
      containerRef.current.contains(selection.anchorNode) &&
      containerRef.current.contains(selection.focusNode)
    ) {
      navigator.clipboard.writeText(selection.toString())
        .then(() => toaster.success({
          description: "Copied to clipboard",
          duration: 1000
        }))
        .catch(err => console.error('Copy failed:', err));
    }
  }, []);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const debouncedHandler = debounce(800, handleTextSelection);
    container.addEventListener('mouseup', debouncedHandler);
    
    return () => {
      container.removeEventListener('mouseup', debouncedHandler);
    };
  }, [handleTextSelection]);

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
      
      <Box ref={containerRef}>
        {firstSequence && (
          <Box fontFamily={'monospace'} height={{ base: "17px", md: "19px" }} letterSpacing={2} lineHeight={{ base: "42px", md: "48px" }}>
            {firstSequence.split('').map((symbol, index) => (
              <Box
                key={`first-${index}`}
                p={0}
                m={0}
                fontSize={{ base: "sm", md: "md" }}
                textAlign="center"
                as={'span'}
                bg={COLOR_MAP[symbol]}
                lineHeight={{ base: "14px", md: "16px" }}
                border={0}
                w={{ base: "14px", md: "16px" }}
                pl={'2px'}
              >
                {symbol}
              </Box>
            ))}
          </Box>
        )}
        
        {secondSequence && (
          <Box fontFamily={'monospace'} height={{ base: "17px", md: "19px" }} w={'100%'} letterSpacing={2} lineHeight={{ base: "42px", md: "48px" }}>
            {secondSequence.split('').map((symbol, index) => {
              const shouldBeColored = symbol !== firstSequence[index];
              return (
                <Box
                  key={`second-${index}`}
                  p={0}
                  m={0}
                  fontSize={{ base: "sm", md: "md" }}
                  textAlign="center"
                  bg={shouldBeColored ? COLOR_MAP[symbol] : 'transparent'} 
                  lineHeight={{ base: "14px", md: "16px" }}
                  as={'span'}
                  border={0}
                  w={{ base: "14px", md: "16px" }}
                  pl={'2px'}
                >
                {symbol}
              </Box>
              )
            })}
          </Box>
        )}
      </Box>
      <Toaster />
    </Box>
    </>
  )
}

export default App