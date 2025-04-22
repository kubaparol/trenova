import { Dumbbell } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex flex-row gap-1 items-center leading-none text-primary">
      <Dumbbell className="size-6" />
      <p className="text-xl font-bold">Trenova</p>
    </div>
  );
}
