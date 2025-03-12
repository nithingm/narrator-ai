import axios from 'axios';
import DEMO_CHARACTERS from '../data/demoCharacters';

export const fetchCharacters = async (
  setCharacters: (characters: any[]) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  try {
    setIsLoading(true);
    const response = await axios.get("http://localhost:5000/api/characters");
    console.log("API Response:", response.data);
    if (response.data && response.data.length > 0) {
      setCharacters(response.data);
    } else {
      console.log("No characters returned from API, using demo data");
      setCharacters(DEMO_CHARACTERS);
    }
  } catch (error) {
    console.error("Error fetching characters:", error);
    console.log("Error fetching characters, using demo data");
    setCharacters(DEMO_CHARACTERS);
  } finally {
    setIsLoading(false);
  }
};
