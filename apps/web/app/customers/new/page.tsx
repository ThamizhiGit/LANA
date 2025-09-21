import CustomerForm from './CustomerForm'

export default function NewCustomerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Customer</h1>
          <p className="text-gray-600 mt-2">Create a new customer record with type-safe validation</p>
        </div>

        <CustomerForm />
      </div>
    </div>
  )
}