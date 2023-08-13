import axios from "axios";

export const getUsers = async () => {
  try {
    const response = await axios.get("https://jsonplaceholder.typicode.com/users");
    return response.data;
  } catch (error) {
    return { success: false };
  }
};
