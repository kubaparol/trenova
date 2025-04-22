import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { DeleteAccountForm } from "../forms/DeleteAccountForm";
import { deleteAccount } from "@/db/actions/profiles/delete-account";

export function SettingsView() {
  const handleDeleteAccount = async () => {
    "use server";

    await deleteAccount();
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h3 className="text-lg font-medium">Usunięcie konta</h3>
        <p className="text-sm text-muted-foreground">
          Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną
          trwale usunięte.
        </p>
      </header>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" className="gap-1">
            <Trash2 className="h-4 w-4" />
            Usuń konto
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-destructive">Usuń konto</DialogTitle>
            <DialogDescription>
              Ta akcja jest <strong>nieodwracalna</strong>. Spowoduje trwałe
              usunięcie Twojego konta i wszystkich powiązanych danych.
            </DialogDescription>
          </DialogHeader>

          <DeleteAccountForm onSubmit={handleDeleteAccount} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
