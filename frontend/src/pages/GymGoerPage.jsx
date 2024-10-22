import { useState, useEffect } from "react";
import { Box, Button, Container, Heading, VStack, Input, HStack, SimpleGrid, useToast } from "@chakra-ui/react"
import { useScheduleStore } from "../store/schedule";
import { useStudentStore } from "../store/student";
import BookScheduleCard from "../components/BookScheduleCard";

const GymGoerPage = () => {
  const [studentName, setStudentName] = useState('');
  const toast = useToast();

  const { fetchSchedules, schedules } = useScheduleStore();
  const { loginStudent, logoutStudent, isLoggedIn, isLoading, student } = useStudentStore();

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleLogin = async () => {
    if (!studentName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a student name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    console.log("Attempting to login with name:", studentName); // Add this line
    const result = await loginStudent(studentName);
    console.log("Login result:", result); // Add this line
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      status: result.success ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLogout = () => {
    logoutStudent();
    setStudentName('');
  };

  return (
    <Container maxW={"container.md"}>
      <VStack spacing={8}>
        <Heading as={"h1"} fontSize={"4xl"} textAlign={"center"} mt={8}>
          Booking Schedule
        </Heading>

        <Box w={"full"} p={6} rounded={"lg"} shadow={"md"}>
          {!isLoggedIn ? (
            <HStack spacing={4}>
              <Input
                flex={1}
                placeholder="Enter Name"
                name="Name of Student"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <Button 
                flex={1} 
                onClick={handleLogin}
                isLoading={isLoading}
              >
                Login
              </Button>
            </HStack>
          ) : (
            <HStack spacing={4}>
              <Box flex={1}>Logged in as: {student.name}</Box>
              <Button flex={1} onClick={handleLogout}>
                Logout
              </Button>
            </HStack> )}
        </Box>

        {isLoggedIn && (
          <>
            <Heading as={"h2"} fontSize={"3xl"} textAlign={"center"}>
              Schedules
            </Heading>

            <Container maxW={"full"} p={6} rounded={"lg"} shadow={"md"}>
              <VStack spacing={5}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {schedules.map((schedule) => (
                    <BookScheduleCard key={schedule._id} schedule={schedule} />
                  ))}
                </SimpleGrid>
              </VStack>
            </Container>
          </>
        )}
      </VStack>
    </Container>
  );
}

export default GymGoerPage;