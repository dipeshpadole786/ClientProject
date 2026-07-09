function PaymentTable({ payments }) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No payments found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-3 px-4 font-medium">Roll No.</th>
            <th className="py-3 px-4 font-medium">Student Name</th>
            <th className="py-3 px-4 font-medium">Amount</th>
            <th className="py-3 px-4 font-medium">Transaction ID</th>
            <th className="py-3 px-4 font-medium">Payment Date</th>
            <th className="py-3 px-4 font-medium">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 px-4 font-medium text-gray-700">
                {payment.rollNumber}
              </td>
              <td className="py-3 px-4">{payment.studentName}</td>
              <td className="py-3 px-4 text-green-600 font-medium">
                ₹{payment.amount.toLocaleString()}
              </td>
              <td className="py-3 px-4">{payment.transactionId}</td>
              <td className="py-3 px-4">{payment.paymentDate}</td>
              <td className="py-3 px-4 text-gray-500">
                {payment.remarks || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PaymentTable
