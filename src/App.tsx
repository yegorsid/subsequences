import { Box, Button, CloseButton, Field, Flex, Input, InputGroup, Separator, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState} from 'react';
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

function isOdd(number: number) {
  return Math.abs(number % 2) === 1;
}

function App() {
  const [firstSequence, setFirstSequence] = useState('');
  const [secondSequence, setSecondSequence] = useState('');
  const [charsPerLine, setCharsPerLine] = useState(0);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const secondInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const aminoAcidCharSize = '16px';

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

  const { linesA, linesB } = useMemo(() => {
    if (charsPerLine <= 0) return { linesA: [], linesB: [] };
    
    const splitText = (text: string): string[] => {
      const lines = [];
      for (let i = 0; i < text.length; i += charsPerLine) {
        lines.push(text.slice(i, i + charsPerLine));
      }
      return lines;
    };

    return {
      linesA: splitText(firstSequence),
      linesB: splitText(secondSequence)
    };
  }, [firstSequence, secondSequence, charsPerLine]);

  const totalLines = useMemo(() => {
    return Math.max(linesA.length, linesB.length) * 2;
  }, [linesA, linesB]);

  const renderedLines = useMemo(() => {
    return Array.from({ length: totalLines }).map((_, lineIndex) => {
      const isLineA = lineIndex % 2 === 0;
      const contentIndex = Math.floor(lineIndex / 2);
      
      if (isLineA) {
        return {
          content: linesA[contentIndex] || '',
          isTextA: true,
          startGlobalIndex: contentIndex * charsPerLine
        };
      } else {
        return {
          content: linesB[contentIndex] || '',
          isTextA: false,
          startGlobalIndex: contentIndex * charsPerLine
        };
      }
    });
  }, [linesA, linesB, totalLines, charsPerLine]);

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
  const updateCharsPerLine = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    setCharsPerLine(Math.floor(containerWidth / 16));
  };

  updateCharsPerLine();
  window.addEventListener('resize', updateCharsPerLine);
  
  return () => window.removeEventListener('resize', updateCharsPerLine);
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
      <Box w={'full'} ref={containerRef}>
        {renderedLines.map((line, lineIndex) => (
          <Box 
            key={lineIndex}
            marginBottom={isOdd(lineIndex) ? '16px' : '0'}
            height={'24px'}
          >
            {Array.from(line.content).map((char, charIndex) => {
              const globalIndex = line.startGlobalIndex + charIndex;
              
              if (line.isTextA) {
                return (
                  <Box
                    key={`${lineIndex}-${charIndex}`}
                    as="span"
                    display="inline-block"
                    w={aminoAcidCharSize}
                    textAlign="center"
                    fontSize={aminoAcidCharSize}
                    fontFamily="mono"
                    border={0}
                    bg={COLOR_MAP[char]}
                  >
                    {char}
                  </Box>
                );
              }
              
              const isDifferent = 
                globalIndex >= firstSequence.length || 
                char !== firstSequence[globalIndex];
              
              return (
                <Box
                  key={`${lineIndex}-${charIndex}`}
                  as="span"
                  display="inline-block"
                  w={aminoAcidCharSize}
                  textAlign="center"
                  fontSize={aminoAcidCharSize}
                  fontFamily="mono"
                  border={0}
                  bg={isDifferent ? COLOR_MAP[char] : 'transparent'}
                >
                  {char}
                </Box>
              );
            })}
          </Box>
        ))
      }
      </Box>
      <Toaster />
    </Box>
    </>
  )
}

export default App