import { montserrat } from "@/constants/fonts";

export default function Logo() {
  return (
    <div className="flex flex-row gap-1 items-center leading-none text-primary">
      <p
        className={`${montserrat.className} text-xl font-bold uppercase tracking-wide`}
      >
        Trenova
      </p>
    </div>
  );
}
