import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="w-full h-full flex flex-col items-center text-center">
        <div className="flex flex-col items-center">
          <h1>NUANSA Cultural Production</h1>
          <h3>presents</h3>
        </div>
        <div className="relative flex-1 w-full">
          <Image src="/images/home/the-crying-stone.png" alt="The Crying Stone" fill style={{ objectFit="contain" }} />
        </div>
        <div className="flex flex-col items-center">
          <p>Early bird sale ends on 1 July. Limited seats available.</p>
          <button>Reserve my seats!</button>
        </div>
      </div>
      <div className="hidden text-center">
        <h2>Looking to buy tickets?</h2>
        <div>
          <p>By clicking below, you will be redirected to our store front page.</p>
          <p>You will be able to choose your seat allocation on this website after we have sent you a confirmation email for your purchase. This may take up to 72 hours after transaction.</p>
        </div>
        <button>Take me to the store!</button>
        <Link href="/login">
          <p>I have purchased my tickets and have received a confirmation email!</p>
        </Link>
      </div>
    </>
  );
}
