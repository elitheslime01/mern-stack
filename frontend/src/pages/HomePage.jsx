import { Button, Container, Flex } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <Container maxW={"1000px"} h="100vh" display="flex" justifyContent="center" alignItems="center">
      <Flex 
        flexDir={{base: "column", sm: "row"}}
        justifyContent="center"
        gap={4}
      >
        <Link to={"/sysadmin"}>
          <Button 
            size="lg" 
            w="200px" 
            h="200px" 
            fontSize="24px"
          >
            System Admin
          </Button>
        </Link>

        <Link to={"/gymgoer"}>
          <Button 
            size="lg" 
            w="200px" 
            h="200px" 
            fontSize="24px"
          >
            Gym Goer
          </Button>
        </Link>
        
      </Flex>
    </Container>
  )
}

export default HomePage