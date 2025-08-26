import { useNavigate } from "react-router-dom";
import LocationForm from "../components/LocationForm";
import { createLocation } from "../services/locationsService";

const AddLocation = () => {
  const navigate = useNavigate();

  const handleAdd = async (data) => {
    try {
      const res = await createLocation(data); // POST request
      const newLocation = res.data; // returned from API
      // Navigate back to list with state to trigger refetch
      navigate("/locations", { state: { locationAdded: true } });
    } catch (err) {
      console.error("Error adding location:", err);
      alert("Failed to add location.");
    }
  };

  return <LocationForm onSubmit={handleAdd} />;
};

export default AddLocation;
