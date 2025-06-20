import { z } from "zod";

export const DenunciaSchema = z.object({
    tipo: z.enum([ "violencia","drogas","vandalismo","iluminacao","abandono","outros" ]),
    descricao: z.string().min(10, "Descreva com pelo menos 10 caracteres"),
    endereco: z.string().optional(),
    latitude: z.string().refine((v) => !isNaN(parseFloat(v)), "Latitude inválida"),
    longitude: z.string().refine((v) => !isNaN(parseFloat(v)), "Longitude inválida"),
    imageBase64: z.string().optional(),
});

export type DenunciaInput = z.infer<typeof DenunciaSchema>;