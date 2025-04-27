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
import { deleteAccount } from "@/db/actions/auth/delete-account";
import ChangePasswordForm, {
  ChangePasswordFormValues,
} from "../forms/ChangePasswordForm";
import { changePassword } from "@/db/actions/auth/change-password";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsView() {
  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    "use server";

    await changePassword(values);
  };

  const handleDeleteAccount = async () => {
    "use server";

    await deleteAccount();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to enhance account security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm onSubmit={handleChangePassword} />
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>
            Deleting your account is irreversible. All your data will be
            permanently removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-1">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  This action is <strong>irreversible</strong>. It will
                  permanently delete your account and all associated data.
                </DialogDescription>
              </DialogHeader>

              <DeleteAccountForm onSubmit={handleDeleteAccount} />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
