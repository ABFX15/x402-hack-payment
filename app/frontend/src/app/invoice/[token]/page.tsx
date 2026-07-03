import InvoiceWrapper from "./InvoiceWrapper";

export default async function InvoicePayPage({
  params: paramsPromise,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await paramsPromise;
  return (
    <>
      <h1 className="sr-only">Invoice Payment - Offbank</h1>
      <InvoiceWrapper token={token} />
    </>
  );
}
