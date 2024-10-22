import { Box, Button, HStack, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import PropTypes from 'prop-types';
import { useScheduleStore } from "../store/schedule";
import { useState } from "react";

const ScheduleCard = ({ schedule }) => {
    
    const { isOpen, onOpen, onClose } = useDisclosure()

    const toast = useToast()

    const [updatedSchedule, setUpdatedSchedule] = useState(schedule)

    const {deleteSchedule, updateSchedule} = useScheduleStore()
    
    const handleDeleteSchedule = async (sid) => {
        const {success, message} = await deleteSchedule(sid);
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
    };
    const handleUpdateSchedule = async (sid, updatedSchedule) => {
        const {success, message} = await updateSchedule(sid, updatedSchedule);
        onClose();
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
              description: "Successfully updated the schedule",
              status: "success",
              duration: 3000,
              isClosable: true
            })
          }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Returns the date part (YYYY-MM-DD)
    };

    return (
        <Box 
            borderWidth={1} 
            borderRadius="md" 
            shadow="md" 
            overflow={"hidden"} 
            transform={"all 0.3s"} 
            _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
        >
            <Box p={4}>
                <Text><strong>Date:</strong> {formatDate(schedule.schedDate)}</Text>
                <Text><strong>Time:</strong> {schedule.schedTime}</Text>
                <Text><strong>Available Slot:</strong> {schedule.availableSlot}</Text>
                <Text><strong>Availability:</strong> {schedule.schedAvailability}</Text>
                <HStack spacing={2}>
                    <IconButton 
                        icon={<EditIcon />} 
                        aria-label="Edit Schedule" 
                        onClick={onOpen} 
                    />
                    <IconButton 
                        icon={<DeleteIcon />} 
                        aria-label="Delete Schedule" 
                        onClick={() => handleDeleteSchedule(schedule._id)} 
                    />
                </HStack>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>Update Schedule</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                    <VStack spacing={4}>
                        <Input
                        placeholder="Enter Schedule Date (yyyy-MM-dd)"
                        name="Schedule Date"
                        value={updatedSchedule.schedDate}
                        onChange={(e) => setUpdatedSchedule({...updatedSchedule, schedDate: e.target.value})}
                        />
                        <Input
                        placeholder="Enter Schedule Time (0:00 AM - 00:00 PM)"
                        name="Schedule Time"
                        value={updatedSchedule.schedTime}
                        onChange={(e) => setUpdatedSchedule({...updatedSchedule, schedTime: e.target.value})}
                        />
                        <Input
                        placeholder="Enter Available Slot"
                        name="Available Slot"
                        value={updatedSchedule.availableSlot}
                        onChange={(e) => setUpdatedSchedule({...updatedSchedule, availableSlot: e.target.value})}
                        />
                        <Input
                        placeholder="Enter Schedule Availability (Available/Unavailable/Under Maintenance)"
                        name="Schedule Availability"
                        value={updatedSchedule.schedAvailability}
                        onChange={(e) => setUpdatedSchedule({...updatedSchedule, schedAvailability: e.target.value})}
                        />
                    </VStack>
                    </ModalBody>
                    <ModalFooter gap={4}>
                        <Button  w={"full"} onClick={() => handleUpdateSchedule(schedule._id, updatedSchedule)}>
                        Update
                        </Button>
                        <Button  w={"full"} onClick={onClose}>
                        Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

ScheduleCard.propTypes = {
    schedule: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        schedDate: PropTypes.string.isRequired,
        schedTime: PropTypes.string.isRequired,
        availableSlot: PropTypes.number.isRequired,
        schedAvailability: PropTypes.string.isRequired,
    }).isRequired,
};

export default ScheduleCard;