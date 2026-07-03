import { Suspense } from "react";
import CheckoutWrapper from "./CheckoutWrapper";

export default function CheckoutPage() {
  return (
    <>
      <h1 className="sr-only">Checkout - Offbank</h1>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#34c759] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <CheckoutWrapper />
      </Suspense>
    </>
  );
}
