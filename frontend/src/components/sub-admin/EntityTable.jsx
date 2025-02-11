import EntityTableRow from "./EntityTableRow"

const EntityTable = ({ entities, entityType, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr style={{ background: '#1b68b3' }}>
          <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-white">ID</th>
          <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-white">Name</th>
          <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-white">Reg. ID</th>
          <th className="hidden md:table-cell px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-white">Email</th>
          <th className="hidden md:table-cell px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-white">Password</th>
          <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-white">Status</th>
          <th className="px-4 md:px-6 py-4 text-left text-xs md:text-sm font-semibold text-white">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {entities.length === 0 ? (
          <tr>
            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
              No students found
            </td>
          </tr>
        ) : (
          entities.map((entity) => (
            <EntityTableRow
              key={entity.id}
              entity={entity}
              entityType={entityType}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
)

export default EntityTable;

