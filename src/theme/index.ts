import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
  },
  fonts: {
    heading: "Poppins, sans-serif",
    body: "Poppins, sans-serif",
  },
  styles: {
    global: (props: { colorMode: string; }) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "md",
      },
      variants: {
        solid: (props: { colorMode: string; }) => ({
          bg: props.colorMode === "dark" ? "brand.500" : "brand.400",
          color: "white",
          _hover: {
            bg: props.colorMode === "dark" ? "brand.600" : "brand.500",
          },
        }),
        outline: (props: { colorMode: string; }) => ({
          borderColor: props.colorMode === "dark" ? "brand.500" : "brand.400",
          color: props.colorMode === "dark" ? "brand.500" : "brand.400",
          _hover: {
            bg: props.colorMode === "dark" ? "brand.500" : "brand.400",
            color: "white",
          },
        }),
      },
    },
    // Añadir más personalizaciones de componentes según sea necesario
  },
});

export default theme;