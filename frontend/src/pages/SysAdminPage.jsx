import { Box, Button, Container, Heading, Input, VStack } from "@chakra-ui/react";
import { useState } from "react"
import { useScheduleStore } from "../store/schedule";

const SysAdminPage = () => {
  const [newSchedule, setNewSchedule] = useState({
    schedDate: "",
    schedTime: "",
    availableSlot: "",
    schedAvailability: "",
  });
  
  const {createSchedule} = useScheduleStore()
  const handleAddSchedule = async() => {
    console.log("Submitting schedule:", newSchedule);
    const {success, message} = await createSchedule(newSchedule)
    console.log("Success: ", success)
    console.log("Message: ", message)
  }

  return (
    <Container maxW = {"container.sm"}>
      <VStack spacing = {8}>

      <Heading as={"h1"} fontSize={"4xl"} textAlign={"center"} mb={8}>
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
              onChange={(e) => setNewSchedule({...newSchedule, availableSlot: e.target.value})}
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

      </VStack>
    </Container>
  )
}

export default SysAdminPage