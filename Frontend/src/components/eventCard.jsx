import { Box, Text, Link, Icon, VStack, Flex } from "@chakra-ui/react";
import { FaChevronRight, FaCalendarAlt } from "react-icons/fa";

import { useState } from "react";

const formatCardDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const EventCard = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasImage = Boolean(props.image);

  return (
    <Link
      w={{ sm: "100%", md: "45%", lg: "45%", xl: "45%" }}
      minWidth={"300px"}
      borderRadius={"8"}
      href={`/events/${props.eventID}`}
      _hover={{ textDecoration: "none" }}
    >
      <VStack
        textAlign={"start"}
        alignItems={"stretch"}
        justifyItems={"center"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        borderRadius={"8"}
        overflow="hidden"
        bg="white"
        boxShadow={isHovered ? "lg" : "0 1px 3px rgba(0,0,0,0.12)"}
        transition="box-shadow 0.2s ease, transform 0.2s ease"
        transform={isHovered ? "translateY(-2px)" : "none"}
        spacing={0}
      >
        <Flex
          position="relative"
          w="100%"
          h="220px"
          minHeight={"220px"}
          bgRepeat="no-repeat"
          bgSize="cover"
          bgPosition={"50% 30%"}
          bgImage={hasImage ? `url(${props.image})` : undefined}
          bgGradient={
            hasImage
              ? undefined
              : "linear(135deg, brand.primary, #4a6fe0)"
          }
          alignItems={"center"}
          justifyContent={"flex-end"}
        >
          {!hasImage && (
            <Flex
              position="absolute"
              inset="0"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FaCalendarAlt} boxSize={10} color="whiteAlpha.700" />
            </Flex>
          )}
          <Flex
            position="absolute"
            inset="0"
            bg="rgba(2, 77, 223, 0.15)"
            opacity={isHovered ? 1 : 0}
            transition="opacity 0.2s ease"
            alignItems={"center"}
            justifyContent={"flex-end"}
          >
            {isHovered && (
              <Flex
                bgColor={"#024ddf"}
                height={"100%"}
                alignItems={"center"}
                p="2"
              >
                <Icon as={FaChevronRight} boxSize={5} color="white" />
              </Flex>
            )}
          </Flex>
        </Flex>
        <Flex w="100%" textAlign={"start"} flexDirection={"column"} p={"4"} gap={1}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="brand.primary"
            noOfLines={2}
          >
            {props.title}
          </Text>
          {props.date && (
            <Flex align="center" color="gray.500" fontSize="sm" gap={1}>
              <Icon as={FaCalendarAlt} boxSize={3} />
              <Text>{formatCardDate(props.date)}</Text>
            </Flex>
          )}
          {props.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2} mt={1}>
              {props.description}
            </Text>
          )}
        </Flex>
      </VStack>
    </Link>
  );
};
