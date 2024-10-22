import { Box, Button, Text } from "@chakra-ui/react"
import PropTypes from 'prop-types';


const BookScheduleCard = ({schedule}) => {

    

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
                <Button w={"full"}>Request Slot</Button>
        </Box>
    </Box>
    )
}

BookScheduleCard.propTypes = {
    schedule: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        schedDate: PropTypes.string.isRequired,
        schedTime: PropTypes.string.isRequired,
        availableSlot: PropTypes.number.isRequired,
        schedAvailability: PropTypes.string.isRequired,
    }).isRequired,
};

export default BookScheduleCard