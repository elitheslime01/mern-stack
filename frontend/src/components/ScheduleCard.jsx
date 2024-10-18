import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import PropTypes from 'prop-types';

const ScheduleCard = ({ schedule }) => {
    // Placeholder functions for handling button clicks
    const handleEdit = () => {
        console.log("Edit clicked for schedule:", schedule);
    };

    const handleDelete = () => {
        console.log("Delete clicked for schedule:", schedule);
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
                        onClick={handleEdit} 
                    />
                    <IconButton 
                        icon={<DeleteIcon />} 
                        aria-label="Delete Schedule" 
                        onClick={handleDelete} 
                    />
                </HStack>
            </Box>
        </Box>
    );
};

ScheduleCard.propTypes = {
    schedule: PropTypes.shape({
        schedDate: PropTypes.string.isRequired,
        schedTime: PropTypes.string.isRequired,
        availableSlot: PropTypes.number.isRequired,
        schedAvailability: PropTypes.string.isRequired,
    }).isRequired,
};

export default ScheduleCard;