import { redirect } from "next/navigation";

// Old link: the "Riendzo AI" account lives at /conta
export default function Portal() {
    redirect("/conta");
}
