import { z } from "zod";

export const CreateTenantInputSchema = z.object({
  name: z.string().min(2).max(80),
});

export type CreateTenantInput = z.infer<typeof CreateTenantInputSchema>;
