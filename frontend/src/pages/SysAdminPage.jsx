import { Box, Button, Container, Heading, Input, SimpleGrid, useToast, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react"
import { useScheduleStore } from "../store/schedule";
import ScheduleCard from "../components/ScheduleCard";

const SysAdminPage = () => {
  const [newSchedule, setNewSchedule] = useState({
    schedDate: "",
    schedTime: "",
    availableSlot: "",
    schedAvailability: "",
  });

  const toast = useToast()
  
  const {createSchedule} = useScheduleStore()

  const handleAddSchedule = async() => {
    const {success, message} = await createSchedule(newSchedule)
    if (!success) {
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true
      })
    } else {
      toast({
        title: "Success",
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true
      })
    }
    setNewSchedule({
      schedDate: "",
      schedTime: "",
      availableSlot: "",
      schedAvailability: "",
    });
  }

  const {fetchSchedules, schedules} = useScheduleStore();
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);
  console.log("Schedules: ", schedules);

  return (
    <Container maxW = {"container.sm"}>
      <VStack spacing = {8}>

      <Heading as={"h1"} fontSize={"4xl"} textAlign={"center"} mt={8}>
        Create New Schedule
      </Heading>

        <Box w={"full"} p={6} rounded={"lg"} shadow={"md"}>
          <VStack>
            <Input
              placeholder="Enter Schedule Date (yyyy-MM-dd)"
              name="Schedule Date"
              value={newSchedule.schedDate}
              onChange={(e) => setNewSchedule({...newSchedule, schedDate: e.target.value})}
            />
            <Input
              placeholder="Enter Schedule Time (0:00 AM - 00:00 PM)"
              name="Schedule Time"
              value={newSchedule.schedTime}
              onChange={(e) => setNewSchedule({...newSchedule, schedTime: e.target.value})}
            />
            <Input
              placeholder="Enter Available Slot"
              name="Available Slot"
              value={newSchedule.availableSlot}
              onChange={(e) => setNewSchedule({...newSchedule, availableSlot: Number(e.target.value)})}
            />
            <Input
              placeholder="Enter Schedule Availability (Available/Unavailable/Under Maintenance)"
              name="Schedule Availability"
              value={newSchedule.schedAvailability}
              onChange={(e) => setNewSchedule({...newSchedule, schedAvailability: e.target.value})}
            />
            <Button onClick={handleAddSchedule} w={"full"}>
              Add Schedule
            </Button>
          </VStack>
        </Box>

        <Heading as={"h1"} fontSize={"4xl"} textAlign={"center"} >
          Schedules
        </Heading>

        <Container maxW={"full"} p={6} rounded={"lg"} shadow={"md"}>
          <VStack spacing={5}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {schedules.map((schedule) => {
                return <ScheduleCard key={schedule._id} schedule={schedule} />
              })}
            </SimpleGrid>
          </VStack>
        </Container>

      </VStack>
    </Container>
  )
}

export default SysAdminPage