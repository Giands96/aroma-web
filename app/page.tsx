import { redirect } from "next/navigation";
import { ROUTES } from "@/app/shared/routes/routes";

export default function Home() {
  redirect(ROUTES.HOME);
}
