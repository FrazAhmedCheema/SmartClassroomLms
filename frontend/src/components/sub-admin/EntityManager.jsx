import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux';
import EntityTable from "./EntityTable"
import Pagination from "./Pagination"
import AddEntityModal from "./AddEntityModal"
import EntitySearch from "./EntitySearch"
import EntityHeader from "./EntityHeader"
import CsvImportModal from "./CsvImportModal"  // new import

const EntityManager = ({ entityType, initialEntities, apiEndpoint }) => {
  const { isAuthenticated } = useSelector(state => state.subAdminAuth);
  const navigate = useNavigate();
  // Define idField based on the entityType
  const idField = entityType.toLowerCase() === 'student' ? 'studentId' : 'teacherId';

  const [entities, setEntities] = useState(initialEntities)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEntities, setFilteredEntities] = useState(entities)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false); // new state for CSV modal
  const [isLoading, setIsLoading] = useState(false); // new loading state
  const entitiesPerPage = 5

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sub-admin/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const filtered = (entities || []).filter(entity => entity && (
      (entity.name && entity.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entity.registrationId && entity.registrationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entity.email && entity.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ));
    setFilteredEntities(filtered);
  }, [searchTerm, entities, isAuthenticated])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleAddEntity = async (formData) => {
    try {
      // Get subAdminDomain from localStorage for institute identification
      const subAdminUsername = localStorage.getItem('subAdminUsername');
      const subAdminDomain = subAdminUsername ? subAdminUsername.split('@')[1] : '';

      const dataToSend = {
        name: formData.name,
        registrationId: formData.registrationId,
        email: formData.email,
        password: formData.password || formData.registrationId, // Use registrationId if password is missing
        status: formData.status || 'active',
        role: entityType.toLowerCase(), // Add role based on entityType
        domain: subAdminDomain // Added domain for institute identification
      };

      console.log('Sending data:', dataToSend);

      const response = await fetch(`${apiEndpoint}/add-${entityType.toLowerCase()}`, {
        method: "POST",
        credentials : 'include',
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      
      console.log('Response status:', response.status);

      // Parse the response
      const result = await response.json();
      console.log('Server response:', result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to add entity");
      }

      if (result.success) {
        // Instead of immediately updating the list, show spinner and fetch fresh data
        setIsLoading(true);
        setIsAddModalOpen(false);
        const refreshEndpoint = `${apiEndpoint}/${entityType.toLowerCase()}s`;
        const refreshResponse = await fetch(refreshEndpoint, {
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const transformedData = refreshData.data.map((entity) => ({
            ...entity,
            id: entity[idField],
          }));
          setEntities(transformedData);
        }
        setIsLoading(false);
      }
    } catch (error) {
        navigate('/sub-admin/login');

      console.error("Error adding entity:", error);
      alert(error.message || "Failed to add entity. Please try again.");
    }
  }

  const handleEditEntity = async (id, updatedData) => {
    try {
      const response = await fetch(`${apiEndpoint}/edit-${entityType.toLowerCase()}/${id}`, {
        method: "PUT",
       credentials : 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update entity");
      }

      if (result.success) {
        // Update the local state
        setEntities(prevEntities => 
          prevEntities.map(entity => 
            entity[idField] === id ? { 
              ...entity, 
              ...result.data,
              id: result.data[idField],
              [idField]: result.data[idField]
            } : entity
          )
        );
      }
    } catch (error) {
        navigate('/sub-admin/login');

      console.error("Error updating entity:", error);
      alert(error.message || "Failed to update entity. Please try again.");
    }
  }

  const handleDeleteEntity = async (id) => {
    try {
        console.log('Deleting entity with ID:', id);
      const response = await fetch(`${apiEndpoint}/delete-${entityType.toLowerCase()}/${id}`, {
        credentials : 'include',
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete entity");
      }

      if (result.success) {
        // Update the local state
        setEntities(prevEntities => 
          prevEntities.filter(entity => entity[idField] !== id)
        );
      }
    } catch (error) {
        navigate('/sub-admin/login');

      console.error("Error deleting entity:", error);
      alert(error.message || "Failed to delete entity. Please try again.");
    }
  }

  // Callback after successful CSV import to refresh the state
  const handleCsvImportSuccess = async (importedData) => {
    try {
      setIsLoading(true);
      const refreshEndpoint = `${apiEndpoint}/${entityType.toLowerCase()}s`;
      const refreshResponse = await fetch(refreshEndpoint, {
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh data');
      }

      const refreshData = await refreshResponse.json();
      const transformedData = refreshData.data.map(entity => ({
        ...entity,
        id: entity[idField],
      }));

      setEntities(transformedData);
      setFilteredEntities(transformedData);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
      setIsCsvModalOpen(false); // Close the modal
    }
  };

  // Update CSV import to include role and domain
  const handleCsvImport = async (csvData) => {
    try {
      const subAdminUsername = localStorage.getItem('subAdminUsername');
      const subAdminDomain = subAdminUsername ? subAdminUsername.split('@')[1] : '';

      // Add domain to the request
      const importData = {
        data: csvData,
        role: entityType.toLowerCase(),
        domain: subAdminDomain
      };

      const response = await fetch(`${apiEndpoint}/import-${entityType.toLowerCase()}s`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData),
      });

      // ...rest of the import handling...
    } catch (error) {
      // ...existing error handling...
    }
  };

  const indexOfLastEntity = currentPage * entitiesPerPage
  const indexOfFirstEntity = indexOfLastEntity - entitiesPerPage
  const currentEntities = filteredEntities.slice(indexOfFirstEntity, indexOfLastEntity)

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Update header: add Import CSV button */}
      <EntityHeader 
        entityType={entityType} 
        onAddClick={() => setIsAddModalOpen(true)} 
        onImportClick={() => setIsCsvModalOpen(true)}
      />
      <EntitySearch searchTerm={searchTerm} onSearchChange={handleSearchChange} entityType={entityType} />
      { isLoading ? (
        <div className="text-center p-6">
          Loading...
          {/* Optionally add a spinner icon/component here */}
        </div>
      ) : (
        <>
          <EntityTable
            entities={currentEntities}
            entityType={entityType}
            onEdit={handleEditEntity}
            onDelete={handleDeleteEntity}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredEntities.length / entitiesPerPage)}
            onPageChange={setCurrentPage}
          />
        </>
      )}
      <AddEntityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEntity}
        entityType={entityType}
      />
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        apiEndpoint={apiEndpoint}
        entityType={entityType}
        onImportSuccess={handleCsvImportSuccess}
      />
    </div>
  )
}

export default EntityManager