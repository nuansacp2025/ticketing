export default function Page() {
  return (
    <div className="flex flex-col items-center">
      <div>
        <div>
          <label htmlFor="email">
            Email
          </label>
          <input name="email" type="email" value="your.email@example.com" disabled />
        </div>
        <div>
          <label htmlFor="ticket-code">
            Ticket Code
          </label>
          <input name="ticket-code" type="text" value="AB1234" disabled />
        </div>
        <p>I have another ticket.</p>
      </div>
      <div>
        <div>
          <p>You have not completed the seat selection process.</p>
          <p>Missing: 5 seats of "Category A", 3 seats of "Category B"</p>
        </div>
        <button>Reserve seats</button>
      </div>
    </div>
  );
}
