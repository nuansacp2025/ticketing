import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center text-center">
      <h2>Thank you for your purchase!</h2>
      <p>To continue, please enter your details below.</p>
      <div>
        <label htmlFor="email">
          Email
        </label>
        <input name="email" type="email" placeholder="your.email@example.com" />
      </div>
      <div>
        <label htmlFor="ticket-code">
          Ticket Code
        </label>
        <input name="ticket-code" type="string" placeholder="e.g. AB1234" />
      </div>
      <div>
        <Link href="/help#find-ticket-code">
          <p>How do I find my ticket code?</p>
        </Link>
        <button>Submit</button>
      </div>
    </div>
  );
}
