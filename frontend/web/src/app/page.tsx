export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h2 className="text-3xl font-bold mb-4 text-blue-900">Welcome to the Tanzania Voting Platform</h2>
      <p className="text-lg text-gray-700 mb-2">
        Secure, real-time voting for presidential, parliamentary, and councillor elections.
      </p>
      <p className="text-gray-500">
        Please register or log in to participate in the election process.
      </p>
    </section>
  );
}
