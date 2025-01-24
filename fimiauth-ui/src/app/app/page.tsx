import { kAppConstants } from "@/src/definitions/appConstants.js";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: kAppConstants.name,
  description: kAppConstants.description,
};

export default function AppPage() {
  return (
    <main className="h-screen">
      <AppContainer />
    </main>
  );
}
