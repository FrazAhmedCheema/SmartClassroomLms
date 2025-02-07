import EntityTableRow from "./EntityTableRow"

const EntityTable = ({ entities, entityType, onEdit, onDelete }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">ID</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Name</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Registration ID</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Email</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Password</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Status</th>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Actions</th>
        </tr>
      </thead>
      <tbody>
        {entities.map((entity) => (
          <EntityTableRow
            key={entity.id}
            entity={entity}
            entityType={entityType}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  </div>
)

export default EntityTable

