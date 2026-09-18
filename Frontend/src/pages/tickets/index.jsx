import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Badge,
  Button,
  Input,
  Stack,
  Link,
  Icon,
} from "@chakra-ui/react";
import { FaTicketAlt, FaMapMarkerAlt, FaExchangeAlt } from "react-icons/fa";
import useAuthStore from "../../store/useAuthStore";
import useTicketStore from "../../store/ticketStore";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const TicketCard = ({ ticket }) => {
  const { user } = useAuthStore();
  const { transferTicket, transferStatus, transferMessage } = useTicketStore();
  const [transferOpen, setTransferOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [email, setEmail] = useState("");

  const status = transferStatus[ticket.TicketID];
  const message = transferMessage[ticket.TicketID];

  const handleTransfer = () => {
    if (!email) return;
    transferTicket(ticket.TicketID, email, user?.UserID);
  };

  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      bg="white"
      borderRadius="8px"
      boxShadow="0 1px 4px rgba(0,0,0,0.12)"
      overflow="hidden"
      mb={5}
      border="1px solid"
      borderColor="gray.100"
    >
      <Box
        w={{ base: "100%", sm: "180px" }}
        h={{ base: "140px", sm: "auto" }}
        flexShrink={0}
        bgImage={`url(${ticket.EventImageUrl})`}
        bgSize="cover"
        bgPosition="center"
        bgColor="gray.200"
      />
      <Box p={4} flex="1">
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={2}>
          <Box>
            <Heading as="h3" fontSize="lg" mb={1}>
              {ticket.EventName}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {formatDate(ticket.EventDate)}
            </Text>
            {ticket.VenueName && (
              <Flex align="center" mt={1} color="gray.600" fontSize="sm">
                <Icon as={FaMapMarkerAlt} mr={1} />
                <Text>
                  {ticket.VenueName}
                  {ticket.VenueLocation ? ` — ${ticket.VenueLocation}` : ""}
                </Text>
              </Flex>
            )}
          </Box>
          <Badge colorScheme="blue" fontSize="0.7em" px={2} py={1} borderRadius="4px">
            {ticket.Number}
          </Badge>
        </Flex>

        <Flex mt={4} gap={3} wrap="wrap">
          <Button
            size="sm"
            leftIcon={<Icon as={FaTicketAlt} />}
            variant="outline"
            colorScheme="blue"
            onClick={() => setDetailsOpen((v) => !v)}
          >
            {detailsOpen ? "Hide ticket" : "View ticket"}
          </Button>
          <Button
            size="sm"
            leftIcon={<Icon as={FaExchangeAlt} />}
            variant="outline"
            colorScheme="gray"
            onClick={() => setTransferOpen((v) => !v)}
          >
            Transfer
          </Button>
        </Flex>

        {detailsOpen && (
          <Box mt={4} p={3} bg="gray.50" borderRadius="6px" fontSize="sm">
            <Text>
              <strong>Seat:</strong>{" "}
              {ticket.SeatSection || "General Admission"}
              {ticket.SeatRow ? `, Row ${ticket.SeatRow}` : ""}
              {ticket.SeatNumber ? `, Seat ${ticket.SeatNumber}` : ""}
            </Text>
            <Text>
              <strong>Price paid:</strong> ${Number(ticket.Amount).toFixed(2)}
            </Text>
            <Text>
              <strong>Ticket #:</strong> {ticket.Number}
            </Text>
          </Box>
        )}

        {transferOpen && (
          <Box mt={4} p={3} bg="gray.50" borderRadius="6px">
            <Text fontSize="sm" mb={2} color="gray.700">
              Enter the email of the ticketmaster account to transfer this
              ticket to:
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} spacing={2}>
              <Input
                size="sm"
                type="email"
                placeholder="recipient@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="white"
              />
              <Button
                size="sm"
                colorScheme="blue"
                isLoading={status === "loading"}
                onClick={handleTransfer}
              >
                Send
              </Button>
            </Stack>
            {message && (
              <Text
                fontSize="sm"
                mt={2}
                color={status === "success" ? "green.600" : "red.500"}
              >
                {message}
              </Text>
            )}
          </Box>
        )}
      </Box>
    </Flex>
  );
};

const MyTickets = () => {
  const { user } = useAuthStore();
  const { tickets, loading, error, fetchMyTickets } = useTicketStore();

  useEffect(() => {
    if (user?.UserID) {
      fetchMyTickets(user.UserID);
    }
  }, [user, fetchMyTickets]);

  if (!user) {
    return (
      <Flex direction="column" align="center" justify="center" py={20} px={4}>
        <Heading as="h2" fontSize="2xl" mb={3}>
          Sign in to view your tickets
        </Heading>
        <Text color="gray.600" mb={4} textAlign="center">
          Your purchased and transferred tickets will show up here once
          you're signed in.
        </Text>
        <Link href="/login">
          <Button colorScheme="blue">Sign In</Button>
        </Link>
      </Flex>
    );
  }

  return (
    <Box maxW="900px" mx="auto" p={{ base: 4, md: 8 }}>
      <Heading as="h1" fontSize="2xl" mb={6}>
        My Tickets
      </Heading>

      {loading && <Text>Loading your tickets...</Text>}
      {error && <Text color="red.500">{error}</Text>}

      {!loading && !error && tickets.length === 0 && (
        <Box textAlign="center" py={16} color="gray.500">
          <Icon as={FaTicketAlt} boxSize={10} mb={3} />
          <Text>You don't have any tickets yet.</Text>
        </Box>
      )}

      {!loading &&
        !error &&
        tickets.map((ticket) => (
          <TicketCard key={ticket.TicketID} ticket={ticket} />
        ))}
    </Box>
  );
};

export default MyTickets;
