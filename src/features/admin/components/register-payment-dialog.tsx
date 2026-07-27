import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { registerPayment } from "@/features/admin/api/subscriptions-api";
import { registerPaymentSchema, type RegisterPaymentValues } from "@/features/admin/schemas/register-payment-schema";
import type { RanchSubscription } from "@/features/admin/types/subscriptions";
import { useAuth } from "@/features/auth/context/use-auth";
import { translateError } from "@/lib/error-messages";

interface RegisterPaymentDialogProps {
  subscription: RanchSubscription | null;
  onOpenChange: (open: boolean) => void;
  onRegistered: (subscription: RanchSubscription) => void;
}

const paymentMethodItems = [
  { label: "Seleccioná un método", value: null },
  { label: "QR", value: "qr" },
  { label: "Transferencia", value: "transfer" },
];

export function RegisterPaymentDialog({ subscription, onOpenChange, onRegistered }: RegisterPaymentDialogProps) {
  const { session } = useAuth();
  const isOpen = subscription !== null;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof registerPaymentSchema>, unknown, RegisterPaymentValues>({
    resolver: zodResolver(registerPaymentSchema),
    defaultValues: {
      amount: undefined,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: undefined,
      periodExtendedMonths: 1,
      externalReference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        amount: undefined,
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod: undefined,
        periodExtendedMonths: 1,
        externalReference: "",
        notes: "",
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: RegisterPaymentValues) => {
    if (!subscription || !session) return;
    try {
      const result = await registerPayment(
        subscription.idRanch,
        {
          amount: values.amount,
          paymentDate: values.paymentDate,
          paymentMethod: values.paymentMethod,
          periodExtendedMonths: values.periodExtendedMonths,
          externalReference: values.externalReference || undefined,
          notes: values.notes || undefined,
          localId: crypto.randomUUID(),
        },
        session.accessToken,
      );
      toast.success(`Pago registrado para ${subscription.ranch.name}`);
      onRegistered(result.subscription);
      onOpenChange(false);
    } catch (error) {
      toast.error(translateError(error, "No se pudo registrar el pago."));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>{subscription?.ranch.name} — comprobante recibido por fuera del sistema</DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!errors.amount}>
              <FieldLabel htmlFor="amount">Monto (Bs)</FieldLabel>
              <Input id="amount" type="number" step="0.01" min="0" aria-invalid={!!errors.amount} {...register("amount")} />
              <FieldError errors={[errors.amount]} />
            </Field>

            <Field data-invalid={!!errors.paymentDate}>
              <FieldLabel htmlFor="paymentDate">Fecha del pago</FieldLabel>
              <Input id="paymentDate" type="date" aria-invalid={!!errors.paymentDate} {...register("paymentDate")} />
              <FieldError errors={[errors.paymentDate]} />
            </Field>

            <Field data-invalid={!!errors.paymentMethod}>
              <FieldLabel htmlFor="paymentMethod">Método de pago</FieldLabel>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select items={paymentMethodItems} value={field.value ?? null} onValueChange={field.onChange}>
                    <SelectTrigger id="paymentMethod" className="w-full" aria-invalid={!!errors.paymentMethod}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="qr">QR</SelectItem>
                        <SelectItem value="transfer">Transferencia</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.paymentMethod]} />
            </Field>

            <Field data-invalid={!!errors.periodExtendedMonths}>
              <FieldLabel htmlFor="periodExtendedMonths">Meses que extiende</FieldLabel>
              <Input
                id="periodExtendedMonths"
                type="number"
                min="1"
                step="1"
                aria-invalid={!!errors.periodExtendedMonths}
                {...register("periodExtendedMonths")}
              />
              <FieldError errors={[errors.periodExtendedMonths]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="externalReference">Referencia del comprobante (opcional)</FieldLabel>
              <Input id="externalReference" placeholder="comprobante-qr-00123.jpg" {...register("externalReference")} />
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notas (opcional)</FieldLabel>
              <Input id="notes" placeholder="Pago recibido por WhatsApp" {...register("notes")} />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              Registrar pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
