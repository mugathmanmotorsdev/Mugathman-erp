import { 
    Dialog, 
    DialogTrigger, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "./ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Plus,
  Mail
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";


import { UseFormReturn } from "react-hook-form";
import { Role } from "@/types/user";

interface InviteUserData {
    name: string;
    email: string;
    role: Role;
}

export default function NewUserDialog({
    form,
    onSubmit = f => f,
    isDialogOpen,
    setIsDialogOpen = f => f
}: {
    form: UseFormReturn<InviteUserData>;
    onSubmit: (data: InviteUserData) => void;
    isDialogOpen: boolean;
    setIsDialogOpen: (value: boolean) => void;
}) {
    
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3E2792] hover:bg-[#322075] text-white px-5 h-11 rounded-xl flex gap-2.5 text-sm font-bold shadow-[0_4px_12px_rgba(62,39,146,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0">
                <Plus size={20} strokeWidth={3} />
                Invite New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] rounded-3xl p-8 border-none shadow-2xl">
              <DialogHeader className="space-y-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-2">
                  <Mail size={28} />
                </div>
                <DialogTitle className="text-2xl font-bold text-slate-900">
                  Invite Team Member
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-base">
                  The user will receive an email to set up their password and
                  activate their account.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 pt-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Cooper"
                            className="h-12 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition-all shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="jane.cooper@truckpro.com"
                            className="h-12 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition-all shadow-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-slate-700 font-bold text-[13px] uppercase tracking-wider">
                          System Role
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white transition-all shadow-none">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem
                              value="ADMIN"
                              className="py-3 font-medium"
                            >
                              Admin
                            </SelectItem>
                            <SelectItem
                              value="EDITOR"
                              className="py-3 font-medium"
                            >
                              Editor
                            </SelectItem>
                            <SelectItem
                              value="VIEWER"
                              className="py-3 font-medium"
                            >
                              Viewer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4 flex !justify-between gap-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsDialogOpen(false)}
                      className="h-12 rounded-xl flex-1 font-bold text-slate-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#3E2792] hover:bg-[#322075] h-12 rounded-xl flex-1 font-bold shadow-lg shadow-indigo-100"
                    >
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
        </Dialog>
    )
}