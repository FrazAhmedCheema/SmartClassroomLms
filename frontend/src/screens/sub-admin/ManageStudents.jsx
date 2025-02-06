import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import EntityManager from "../../components/sub-admin/EntityManager"
import Navbar from "../../components/sub-admin/Navbar"
import Sidebar from "../../components/sub-admin/Sidebar"

const ManageStudents = () => {
  const [studentsData, setStudentsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:8080/sub-admin/students",{
          credentials : 'include',
          headers :{
            "Content-Type": "application/json",
            
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }
        const data = await response.json()
        // Transform the data to match the desired structure
        const transformedData = data.data.map((student) => ({
          ...student,
          id: student.studentId,
        }))
        setStudentsData(transformedData)
      } catch (error) {
        navigate('/sub-admin/login');
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      <div className="ml-64 pt-16">
        <main className="p-6">
          <EntityManager
            entityType="Student"
            initialEntities={studentsData}
            apiEndpoint="http://localhost:8080/sub-admin"
          />
        </main>
      </div>
    </div>
  )
}

export default ManageStudents

